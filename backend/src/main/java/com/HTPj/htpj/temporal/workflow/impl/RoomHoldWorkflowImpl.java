package com.HTPj.htpj.temporal.workflow.impl;

import com.HTPj.htpj.temporal.activity.RoomHoldActivities;
import com.HTPj.htpj.temporal.workflow.RoomHoldWorkflow;
import io.temporal.activity.ActivityOptions;
import io.temporal.workflow.Workflow;
import java.time.Duration;

public class RoomHoldWorkflowImpl implements RoomHoldWorkflow {

    private long expireTime;
    private final RoomHoldActivities activities =
            Workflow.newActivityStub(
                    RoomHoldActivities.class,
                    ActivityOptions.newBuilder()
                            .setStartToCloseTimeout(Duration.ofSeconds(10))
                            .build()
            );

    @Override
    public void startRoomHold(String holdCode, long expireEpochMillis) {

        this.expireTime = expireEpochMillis;

        while (true) {

            long now = Workflow.currentTimeMillis();
            long delay = expireTime - now;

            if (delay <= 0) {
                activities.expireHold(holdCode);
                return;
            }

            Workflow.await(
                    Duration.ofMillis(delay),
                    () -> Workflow.currentTimeMillis() >= expireTime
            );
        }
    }

    @Override
    public void extendHold(long newExpireEpochMillis) {
        this.expireTime = newExpireEpochMillis;
    }
}
