package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
