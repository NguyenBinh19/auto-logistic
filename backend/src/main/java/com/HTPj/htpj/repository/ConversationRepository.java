package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, String> {

    List<Conversation> findByUser1_IdOrUser2_Id(String user1, String user2);

    Optional<Conversation> findByUser1_IdAndUser2_IdAndReferenceId(
            String user1,
            String user2,
            String referenceId
    );
}