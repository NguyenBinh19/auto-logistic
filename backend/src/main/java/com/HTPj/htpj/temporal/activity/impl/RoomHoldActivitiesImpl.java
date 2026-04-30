package com.HTPj.htpj.temporal.activity.impl;

import com.HTPj.htpj.entity.RoomHold;
import com.HTPj.htpj.repository.RoomHoldRepository;
import com.HTPj.htpj.temporal.activity.RoomHoldActivities;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class RoomHoldActivitiesImpl implements RoomHoldActivities {

    private final RoomHoldRepository roomHoldRepository;

    @Override
    public void expireHold(String holdCode) {

        RoomHold hold = roomHoldRepository.findByHoldCode(holdCode)
                .orElseThrow();

        if ("HOLDING".equals(hold.getStatus())) {
            hold.setStatus("EXPIRED");
            roomHoldRepository.save(hold);
        }
    }
}
