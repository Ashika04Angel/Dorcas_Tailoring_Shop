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

@WebServlet("/saveCustomer")
public class SaveCustomerServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String name = request.getParameter("name");
        String phone = request.getParameter("phone");

        try {
            // 1. Load the Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // 2. Cloud Connection Details from Environment Variables
            String dbHost = System.getenv("DB_HOST");
            String dbPort = System.getenv("DB_PORT");
            String dbUser = System.getenv("DB_USER");
            String dbPass = System.getenv("DB_PASS");
            
            // Using the robust SSL connection string
            String url = "jdbc:mysql://" + dbHost + ":" + dbPort + "/shop_db?useSSL=true&trustServerCertificate=true";

            // 3. Try-with-resources automatically closes the connection
            try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass)) {
                
                String sql = "INSERT INTO customers (name, phone) VALUES (?, ?)";
                PreparedStatement ps = conn.prepareStatement(sql);
                ps.setString(1, name);
                ps.setString(2, phone);
                
                ps.executeUpdate();
                response.getWriter().write("Success");
            } 
        } catch (Exception e) {
            e.printStackTrace();
            // Printing the error to the screen helps you debug on Render
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}