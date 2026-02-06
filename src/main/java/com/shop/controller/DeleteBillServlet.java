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

@WebServlet("/deleteBill")
public class DeleteBillServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String billId = request.getParameter("billId");

        // ✅ 1. Validate request parameter
        if (billId == null || !billId.matches("\\d+")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write(
                "{\"error\":\"Invalid billId\"}"
            );
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

            String sql = "DELETE FROM bills WHERE id = ?";

            // ✅ 5. Close ALL JDBC resources safely
            try (
                Connection conn = DriverManager.getConnection(url, dbUser, dbPass);
                PreparedStatement ps = conn.prepareStatement(sql)
            ) {
                ps.setInt(1, Integer.parseInt(billId));

                int rowsDeleted = ps.executeUpdate();

                if (rowsDeleted > 0) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write("{\"status\":\"success\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write(
                        "{\"error\":\"Bill not found\"}"
                    );
                }
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
