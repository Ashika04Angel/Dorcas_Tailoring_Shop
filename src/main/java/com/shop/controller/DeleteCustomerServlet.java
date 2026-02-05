package com.shop.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

@WebServlet("/deleteCustomer")
public class DeleteCustomerServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String customerId = request.getParameter("id");

        // 1. Load Cloud Credentials from Environment
        String dbHost = System.getenv("DB_HOST");
        String dbPort = System.getenv("DB_PORT");
        String dbUser = System.getenv("DB_USER");
        String dbPass = System.getenv("DB_PASS");
        String url = "jdbc:mysql://" + dbHost + ":" + dbPort + "/shop_db?useSSL=true&trustServerCertificate=true";

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            
            // 2. Use Try-with-resources for automatic closing
            try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass)) {
                
                String sql = "DELETE FROM customers WHERE id = ?";
                PreparedStatement ps = conn.prepareStatement(sql);
                ps.setInt(1, Integer.parseInt(customerId));
                
                int rowAffected = ps.executeUpdate();
                
                if (rowAffected > 0) {
                    response.getWriter().write("Success");
                } else {
                    response.getWriter().write("Failed: Customer not found");
                }
            } 
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}