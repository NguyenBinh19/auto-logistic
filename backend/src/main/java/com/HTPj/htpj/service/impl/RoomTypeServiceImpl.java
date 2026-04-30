package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.roomtype.CreateRoomTypeRequest;
import com.HTPj.htpj.dto.request.roomtype.UpdateRoomTypeRequest;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeImageResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeListDetailResponse;
import com.HTPj.htpj.dto.response.roomtype.RoomTypeResponse;
import com.HTPj.htpj.entity.Hotel;
import com.HTPj.htpj.entity.RoomType;
import com.HTPj.htpj.entity.RoomTypeImage;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.RoomTypeMapper;
import com.HTPj.htpj.repository.HotelRepository;
import com.HTPj.htpj.repository.RoomTypeImageRepository;
import com.HTPj.htpj.repository.RoomTypeRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.RoomTypeService;
import com.HTPj.htpj.service.S3Service;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RoomTypeImageRepository roomTypeImageRepository;
    private final S3Service s3Service;
    private final UserRepository usersRepository;


    @Override
    public RoomTypeDetailResponse createRoomType(CreateRoomTypeRequest request, MultipartFile[] files) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Hotel hotel = user.getHotel();

        if (hotel == null) {
            throw new AppException(ErrorCode.HOTEL_NOT_FOUND);
        }

        if (roomTypeRepository.existsByRoomCode(request.getRoomCode())) {
            throw new AppException(ErrorCode.ROOM_TYPE_EXISTED);
        }

        String amenities = null;
        try {
            if (request.getAmenities() != null) {
                amenities = objectMapper.writeValueAsString(request.getAmenities());
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid amenities format");
        }


        RoomType roomType = RoomType.builder()
                .hotel(hotel)
                .roomCode(request.getRoomCode())
                .roomTitle(request.getRoomTitle())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .maxAdults(request.getMaxAdults())
                .maxChildren(request.getMaxChildren())
                .roomArea(request.getRoomArea())
                .bedType(request.getBedType())
                .totalRooms(request.getTotalRooms())
                .amenities(amenities)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .roomStatus("active")
                .build();

        RoomType savedRoomType = roomTypeRepository.save(roomType);
        if (files != null && files.length > 0) {

            for (int i = 0; i < files.length; i++) {

                MultipartFile file = files[i];

                if (file.isEmpty()) continue;

                try {
                    String key = "room-types/"
                            + savedRoomType.getRoomTypeId()
                            + "/"
                            + UUID.randomUUID();

                    // Upload S3
                    s3Service.uploadFile(file, key);

                    RoomTypeImage image = RoomTypeImage.builder()
                            .roomType(savedRoomType)
                            .s3Key(key)
                            .createdAt(LocalDateTime.now())
                            .build();

                    roomTypeImageRepository.save(image);

                } catch (Exception e) {
                    throw new RuntimeException("Failed to upload room type image", e);
                }
            }
        }
        List<String> amenitiesList = parseAmenities(savedRoomType.getAmenities());

        return RoomTypeMapper.toDetailResponse(savedRoomType, amenitiesList);
    }


    @Override
    public List<RoomTypeResponse> getRoomTypesByHotelId() {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String userId = jwt.getClaim("userId");

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Hotel hotel = user.getHotel();

        if (hotel == null) {
            throw new AppException(ErrorCode.HOTEL_NOT_FOUND);
        }

        Integer hotelId = hotel.getHotelId();

        List<RoomType> roomTypes = roomTypeRepository.findByHotel_HotelId(hotelId);

        return roomTypes.stream()
                .map(RoomTypeMapper::toListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoomTypeDetailResponse getRoomTypeDetail(Integer roomTypeId) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        List<String> amenitiesList = parseAmenities(roomType.getAmenities());
        List<RoomTypeImage> images =
                roomTypeImageRepository.findByRoomType_RoomTypeId(roomTypeId);

        List<RoomTypeImageResponse> imageResponses = images.stream()
                .map(img -> RoomTypeImageResponse.builder()
                        .imageId(img.getImageId())
                        .imageUrl(s3Service.getFileUrl(img.getS3Key()))
                        .build())
                .toList();

        RoomTypeDetailResponse response =
                RoomTypeMapper.toDetailResponse(roomType, amenitiesList);

        response.setImages(imageResponses);

        return response;

    }

    @Override
    public RoomTypeDetailResponse inactiveRoomType(Integer roomTypeId) {

        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        roomType.setRoomStatus("inactive");
        roomType.setUpdatedAt(LocalDateTime.now());

        RoomType updatedRoomType = roomTypeRepository.save(roomType);

        List<String> amenitiesList = parseAmenities(updatedRoomType.getAmenities());

        return RoomTypeMapper.toDetailResponse(updatedRoomType, amenitiesList);
    }

    private List<String> parseAmenities(String amenitiesJson) {
        try {
            if (amenitiesJson == null || amenitiesJson.isBlank()) {
                return List.of();
            }
            return objectMapper.readValue(amenitiesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse amenities JSON", e);
        }
    }

    @Override
//    @Transactional
    public RoomTypeDetailResponse updateRoomType(Integer roomTypeId, UpdateRoomTypeRequest request, MultipartFile[] newImages
    ) {
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        roomType.setRoomTitle(request.getRoomTitle());
        roomType.setDescription(request.getDescription());
        roomType.setBasePrice(request.getBasePrice());
        roomType.setMaxAdults(request.getMaxAdults());
        roomType.setMaxChildren(request.getMaxChildren());
        roomType.setRoomArea(request.getRoomArea());
        roomType.setBedType(request.getBedType());
        roomType.setTotalRooms(request.getTotalRooms());

        try {
            String amenitiesJson = objectMapper.writeValueAsString(request.getAmenities());
            roomType.setAmenities(amenitiesJson);
        } catch (Exception e) {
            throw new RuntimeException("Invalid amenities format");
        }

        roomType.setUpdatedAt(LocalDateTime.now());
        roomType = roomTypeRepository.save(roomType);

        //img
        //delete
        if (request.getDeletedImageIds() != null &&
                !request.getDeletedImageIds().isEmpty()) {

            List<RoomTypeImage> imagesToDelete =
                    roomTypeImageRepository.findAllById(request.getDeletedImageIds());

            for (RoomTypeImage image : imagesToDelete) {
                s3Service.deleteFile(image.getS3Key());
                roomTypeImageRepository.delete(image);
            }
        }

        //add img
        if (newImages != null && newImages.length > 0) {
            for (int i = 0; i < newImages.length; i++) {

                MultipartFile file = newImages[i];

                if (file == null || file.isEmpty()) continue;

                try {

                    String key = "room-types/"
                            + roomType.getRoomTypeId()
                            + "/"
                            + UUID.randomUUID();

                    s3Service.uploadFile(file, key);

                    RoomTypeImage image = RoomTypeImage.builder()
                            .roomType(roomType)
                            .s3Key(key)
                            .createdAt(LocalDateTime.now())
                            .build();

                    roomTypeImageRepository.save(image);

                } catch (Exception e) {
                    throw new RuntimeException("Failed to upload room type image", e);
                }
            }
        }
        List<RoomTypeImageResponse> imageResponses =
                roomTypeImageRepository.findByRoomType_RoomTypeId(roomTypeId)
                        .stream()
                        .map(img -> RoomTypeImageResponse.builder()
                                .imageId(img.getImageId())
                                .imageUrl(s3Service.getFileUrl(img.getS3Key()))
                                .build())
                        .toList();
        RoomTypeDetailResponse response =
                RoomTypeMapper.toDetailResponse(
                        roomType,
                        parseAmenities(roomType.getAmenities())
                );

        response.setImages(imageResponses);

        return response;
    }

    @Override
    public List<RoomTypeListDetailResponse> getRoomTypeDetailsByHotelId(Integer hotelId) {
        List<RoomType> roomTypes = roomTypeRepository.findByHotel_HotelId(hotelId);

        return roomTypes.stream()
                .map(roomType -> {
                    List<String> amenitiesList = parseAmenities(roomType.getAmenities());
                    return RoomTypeMapper.toListDetailResponse(roomType, amenitiesList);
                })
                .collect(Collectors.toList());
    }

}
