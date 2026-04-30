package com.HTPj.htpj.controller;

import com.HTPj.htpj.dto.request.chat.ConversationDTO;
import com.HTPj.htpj.dto.response.chat.ChatMessageResponse;
import com.HTPj.htpj.entity.Message;
import com.HTPj.htpj.entity.Users;
import com.HTPj.htpj.repository.MessageRepository;
import com.HTPj.htpj.repository.UserRepository;
import com.HTPj.htpj.service.ChatService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChatService chatService;

    @GetMapping("/history")
    public List<ChatMessageResponse> getHistory(
            @RequestParam String conversationId
    ) {
        return chatService.getHistory(conversationId);
    }

    @GetMapping("/conversations")
    public List<ConversationDTO> getConversations(
            @RequestParam String userId
    ) {
        return chatService.getConversations(userId);
    }

    @PostMapping("/init")
    public ConversationDTO initChatWithHotel(
            @RequestParam String hotelId,
            @RequestParam String userId,
            @RequestParam(required = false) String bookingId,
            @RequestParam(required = false) String bookingCode,
            @RequestParam(required = false) String hotelName,
            @RequestParam(required = false) String room,
            @RequestParam(required = false) String checkIn,
            @RequestParam(required = false) String checkOut

    ) {

        System.out.println("=== INIT CHAT ===");
        System.out.println("hotelId: " + hotelId);
        System.out.println("userId: " + userId);
        System.out.println("bookingId: " + bookingId);
        System.out.println("bookingCode: " + bookingCode);
        System.out.println("hotelName: " + hotelName);

        if (hotelId == null || userId == null) {
            throw new RuntimeException("Missing required params");
        }

        return chatService.initChatWithHotel(
                userId,
                hotelId,
                bookingId,
                bookingCode,
                hotelName,
                room,
                checkIn,
                checkOut
        );
    }

    @PostMapping("/init-nego")
    public ConversationDTO initNegotiationChatWithHotel(
            @RequestParam String hotelId,
            @RequestParam String userId,
            @RequestParam(required = false) String bookingId,
            @RequestParam(required = false) String bookingCode,
            @RequestParam(required = false) String hotelName,
            @RequestParam(required = false) String room,
            @RequestParam(required = false) String checkIn,
            @RequestParam(required = false) String checkOut

    ) {

        System.out.println("=== INIT CHAT ===");
        System.out.println("hotelId: " + hotelId);
        System.out.println("userId: " + userId);
        System.out.println("bookingId: " + bookingId);
        System.out.println("bookingCode: " + bookingCode);
        System.out.println("hotelName: " + hotelName);

        if (hotelId == null || userId == null) {
            throw new RuntimeException("Missing required params");
        }

        return chatService.initNegotiationChatWithHotel(
                userId,
                hotelId,
                bookingId,
                bookingCode,
                hotelName,
                room,
                checkIn,
                checkOut
        );
    }

    @PostMapping("/init-regular")
    public ConversationDTO initChatWithHotelRegular(
            @RequestParam String hotelId,
            @RequestParam String userId,
            @RequestParam(required = false) String bookingId,
            @RequestParam(required = false) String bookingCode,
            @RequestParam(required = false) String hotelName
    ) {

        System.out.println("=== INIT CHAT ===");
        System.out.println("hotelId: " + hotelId);
        System.out.println("userId: " + userId);
        System.out.println("bookingId: " + bookingId);
        System.out.println("bookingCode: " + bookingCode);
        System.out.println("hotelName: " + hotelName);

        if (hotelId == null || userId == null) {
            throw new RuntimeException("Missing required params");
        }

        return chatService.initChatRegular(
                userId,
                hotelId,
                bookingId,
                bookingCode,
                hotelName
        );
    }

    @PostMapping("/read")
    @Transactional
    public void markAsRead(@RequestParam String conversationId,
                           @RequestParam String userId) {

        messageRepository.markAsRead(conversationId, userId);
    }
}