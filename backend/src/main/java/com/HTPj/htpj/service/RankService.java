package com.HTPj.htpj.service;

import com.HTPj.htpj.dto.request.rank.*;
import com.HTPj.htpj.dto.response.rank.*;

import java.util.List;

public interface RankService {
    String createRank(CreateRankRequest request);

    String updateRank(Integer id, UpdateRankRequest request);

    RankResponse getRankDetail(Integer id);

    List<RankResponse> getAllRanks();

    String deleteRank(Integer id);

    String updateRankPeriod(UpdateRankPeriodRequest request);

    String getRankPeriod(String type);

    RankPeriodResponse getAllRankPeriods();

    RankDateResponse getLatestPeriod();

    List<AgencyRankChangeResponse> getUpgradeCandidates(RankEvaluateRequest request);

    List<AgencyRankChangeResponse> getDowngradeCandidates(RankEvaluateRequest request);

    AgencyRankDetailResponse getAgencyRankDetail(AgencyRankDetailRequest request);

    String changeRank(ChangeRankRequest request);

    List<RankHistoryResponse> getAllRankHistories();

    List<RankHistoryResponse> getMyAgencyRankHistories();
}
