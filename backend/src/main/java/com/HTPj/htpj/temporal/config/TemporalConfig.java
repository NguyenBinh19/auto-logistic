package com.HTPj.htpj.temporal.config;

import com.HTPj.htpj.repository.RoomHoldRepository;
import com.HTPj.htpj.temporal.activity.impl.RoomHoldActivitiesImpl;
import com.HTPj.htpj.temporal.workflow.impl.RoomHoldWorkflowImpl;
import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.serviceclient.WorkflowServiceStubsOptions;
import io.temporal.worker.Worker;
import io.temporal.worker.WorkerFactory;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class TemporalConfig {

    private final RoomHoldRepository roomHoldRepository;

    @Value("${temporal.connection.target}")
    private String target;

    @Bean
    public WorkflowServiceStubs workflowServiceStubs() {
        return WorkflowServiceStubs.newInstance(
                WorkflowServiceStubsOptions.newBuilder()
                        .setTarget(target)
//                        .setTarget("hms-temporal:7233")
                        .build()
        );
    }

    @Bean
    public WorkflowClient workflowClient(WorkflowServiceStubs serviceStubs) {
        return WorkflowClient.newInstance(serviceStubs);
    }

    @Bean
    public WorkerFactory workerFactory(WorkflowClient workflowClient) {

        WorkerFactory factory = WorkerFactory.newInstance(workflowClient);

        Worker worker = factory.newWorker("ROOM_HOLD_TASK_QUEUE");

        worker.registerWorkflowImplementationTypes(RoomHoldWorkflowImpl.class);

        worker.registerActivitiesImplementations(
                new RoomHoldActivitiesImpl(roomHoldRepository)
        );

        factory.start();

        System.out.println("✅ Temporal Worker started");

        return factory;
    }
}
