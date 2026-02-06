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

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String name = request.getParameter("name");
        String phone = request.getParameter("phone");

        // ✅ 1. Validate input
        if (name == null || name.trim().isEmpty()
                || phone == null || phone.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Name and phone are required\"}");
            return;
        }

        // ✅ 2. Read environment variables
        String url = System.getenv("DB_URL");
        String dbUser = System.getenv("DB_USER");
        String dbPass = System.getenv("DB_PASS");

        // ✅ 3. Validate environment variables
        if (url == null || dbUser == null || dbPass == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(
                "{\"error\":\"Database environment variables are not set\"}"
            );
            return;
        }

        try {
            // ✅ 4. Load JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            String sql = "INSERT INTO customers (name, phone) VALUES (?, ?)";

            // ✅ 5. Close ALL resources safely
            try (
                Connection conn = DriverManager.getConnection(url, dbUser, dbPass);
                PreparedStatement ps = conn.prepareStatement(sql)
            ) {
                ps.setString(1, name.trim());
                ps.setString(2, phone.trim());

                ps.executeUpdate();

                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"status\":\"success\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write(
                "{\"error\":\"" + e.getMessage() + "\"}"
            );
        }
    }
}
