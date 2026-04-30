package com.HTPj.htpj.repository;
import com.HTPj.htpj.entity.HotelImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HotelImageRepository
        extends JpaRepository<HotelImage, Integer> {

    // ✅ dùng cho detail (1 hotel)
    List<HotelImage> findByHotelHotelIdOrderBySortOrderAsc(Integer hotelId);

    // ✅ dùng cho search (nhiều hotel)
    List<HotelImage> findByHotelHotelIdInOrderBySortOrderAsc(List<Integer> hotelIds);

    List<HotelImage> findByHotelHotelIdAndIsCoverTrue(Integer hotelId);

    Optional<HotelImage> findByImageId(Integer imageId);

    void deleteByImageIdIn(List<Integer> ids);

}