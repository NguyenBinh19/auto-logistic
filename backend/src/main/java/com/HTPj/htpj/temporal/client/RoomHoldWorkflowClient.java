package com.HTPj.htpj.temporal.client;

import com.HTPj.htpj.temporal.workflow.RoomHoldWorkflow;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomHoldWorkflowClient {

    private final WorkflowClient workflowClient;

    public void startWorkflow(String holdCode, long expireEpochMillis) {

        WorkflowOptions options = WorkflowOptions.newBuilder()
                .setTaskQueue("ROOM_HOLD_TASK_QUEUE")
                .setWorkflowId("room-hold-" + holdCode)
                .build();

        RoomHoldWorkflow workflow =
                workflowClient.newWorkflowStub(RoomHoldWorkflow.class, options);

        WorkflowClient.start(
                workflow::startRoomHold,
                holdCode,
                expireEpochMillis
        );
    }
    public void extendWorkflow(String holdCode, long newExpireEpochMillis) {

        RoomHoldWorkflow workflow =
                workflowClient.newWorkflowStub(
                        RoomHoldWorkflow.class,
                        "room-hold-" + holdCode
                );

        workflow.extendHold(newExpireEpochMillis);
    }

}
