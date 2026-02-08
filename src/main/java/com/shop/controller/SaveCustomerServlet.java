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

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("name");
        String phone = request.getParameter("phone");

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        if (name == null || name.isBlank()) {
            response.getWriter().write("Error: Name is required");
            return;
        }
        
        if (phone != null && phone.isBlank()) {
            phone = null;
        }

        String url = System.getenv("DB_URL");
        String dbUser = System.getenv("DB_USER");
        String dbPass = System.getenv("DB_PASS");

        if (url == null || dbUser == null || dbPass == null) {
            response.getWriter().write("Error: DB env vars missing");
            return;
        }

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass)) {

                String sql = "INSERT INTO customers (name, phone) VALUES (?, ?)";
                PreparedStatement ps = conn.prepareStatement(sql);
                ps.setString(1, name);
               
                if (phone != null) {
                    ps.setString(2, phone);
                } else {
                    ps.setNull(2, java.sql.Types.VARCHAR);
                }

                ps.executeUpdate();
                response.getWriter().write("Success");
            }

        } catch (Exception e) {
            e.printStackTrace(); 
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}
