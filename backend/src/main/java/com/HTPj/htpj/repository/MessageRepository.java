package com.HTPj.htpj.repository;

import com.HTPj.htpj.dto.project.ChatMessageProjection;
import com.HTPj.htpj.entity.Message;
import com.HTPj.htpj.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {

    @Query(value = """
    SELECT 
        m.sender_id AS senderId,
        m.receiver_id AS receiverId,
        m.content AS content,
        m.created_at AS createdAt
    FROM message m
    WHERE 
        (m.sender_id = :user1 AND m.receiver_id = :user2)
        OR 
        (m.sender_id = :user2 AND m.receiver_id = :user1)
    ORDER BY m.created_at ASC
""", nativeQuery = true)
    List<ChatMessageProjection> getChatHistory(
            @Param("user1") String user1,
            @Param("user2") String user2
    );

    @Query("""
    SELECT m FROM Message m
    WHERE m.sender.id = :userId OR m.receiver.id = :userId
    ORDER BY m.createdAt DESC
""")
    List<Message> findAllMessagesOfUser(@Param("userId") String userId);

    Message findTopBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtDesc(
            String sender1, String receiver1,
            String sender2, String receiver2
    );

    List<Message> findByConversation_IdOrderByCreatedAtAsc(String conversationId);

    Message findTopByConversation_IdOrderByCreatedAtDesc(String conversationId);

    int countByConversation_IdAndReceiver_IdAndSeenFalse(
            String conversationId,
            String receiverId
    );

    @Modifying
    @Query("""
    UPDATE Message m
    SET m.seen = true
    WHERE m.conversation.id = :conversationId
    AND m.receiver.id = :userId
""")
    void markAsRead(String conversationId, String userId);
}