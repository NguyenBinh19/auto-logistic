package com.HTPj.htpj.temporal.workflow;

import io.temporal.workflow.SignalMethod;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

@WorkflowInterface
public interface RoomHoldWorkflow {

    @WorkflowMethod
    void startRoomHold(String holdCode, long expireEpochMillis);

    @SignalMethod
    void extendHold(long newExpireEpochMillis);
}