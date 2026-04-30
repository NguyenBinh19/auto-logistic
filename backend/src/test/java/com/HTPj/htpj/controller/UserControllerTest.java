// package com.HTPj.htpj.controller;

// import java.time.LocalDate;

// import com.HTPj.htpj.dto.request.UserCreationRequest;
// import com.HTPj.htpj.dto.response.UserResponse;
// import com.HTPj.htpj.service.impl.UserServiceImpl;
// import lombok.extern.slf4j.Slf4j;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.mockito.ArgumentMatchers;
// import org.mockito.Mockito;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.http.MediaType;
// import org.springframework.test.context.ActiveProfiles;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
// import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;


// @Slf4j
// @SpringBootTest
// @AutoConfigureMockMvc
// @ActiveProfiles("test")
// class UserControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @MockitoBean
//     private UserServiceImpl userServiceImpl;

//     private UserCreationRequest request;
//     private UserResponse userResponse;
//     private LocalDate dob;

//     @BeforeEach
//     void initData() {
//         dob = LocalDate.of(1990, 1, 1);

//         request = UserCreationRequest.builder()
//                 .username("john")
//                 .firstName("John")
//                 .lastName("Doe")
//                 .password("12345678")
//                 .dob(dob)
//                 .build();

//         userResponse = UserResponse.builder()
//                 .id("cf0600f538b3")
//                 .username("john")
//                 .firstName("John")
//                 .lastName("Doe")
//                 .dob(dob)
//                 .build();
//     }

//     @Test
//     //
//     void createUser_validRequest_success() throws Exception {
//         // GIVEN
//         ObjectMapper objectMapper = new ObjectMapper();
//         objectMapper.registerModule(new JavaTimeModule());
//         String content = objectMapper.writeValueAsString(request);

//         Mockito.when(userServiceImpl.createUser(ArgumentMatchers.any())).thenReturn(userResponse);

//         // WHEN, THEN
//         mockMvc.perform(MockMvcRequestBuilders.post("/users")
//                         .contentType(MediaType.APPLICATION_JSON_VALUE)
//                         .content(content))
//                 .andExpect(MockMvcResultMatchers.status().isOk())
//                 .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000))
//                 .andExpect(MockMvcResultMatchers.jsonPath("result.id").value("cf0600f538b3"));
//     }

//     @Test
//     void createUser_usernameInvalid_fail() throws Exception {
//         // GIVEN
//         request.setUsername("joh");
//         ObjectMapper objectMapper = new ObjectMapper();
//         objectMapper.registerModule(new JavaTimeModule());
//         String content = objectMapper.writeValueAsString(request);

//         // WHEN, THEN
//         mockMvc.perform(MockMvcRequestBuilders.post("/users")
//                         .contentType(MediaType.APPLICATION_JSON_VALUE)
//                         .content(content))
//                 .andExpect(MockMvcResultMatchers.status().isBadRequest())
//                 .andExpect(MockMvcResultMatchers.jsonPath("code").value(1003))
//                 .andExpect(MockMvcResultMatchers.jsonPath("message").value("Username must be at least 4 characters"));
//     }
// }