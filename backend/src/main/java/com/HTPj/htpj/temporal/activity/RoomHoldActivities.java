package com.HTPj.htpj.temporal.activity;

import io.temporal.activity.ActivityInterface;

@ActivityInterface
public interface RoomHoldActivities {

    void expireHold(String holdCode);
}