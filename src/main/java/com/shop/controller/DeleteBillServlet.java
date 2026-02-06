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
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String billId = request.getParameter("billId");

        // 1. Load Cloud Credentials
        String url = System.getenv("DB_URL");
        String dbUser = System.getenv("DB_USER");
        String dbPass = System.getenv("DB_PASS");
        

        try {
            // 2. Load the Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // 3. Delete logic
            try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass)) {
                // Matches the "id" column in your bills table
                String sql = "DELETE FROM bills WHERE id = ?";
                PreparedStatement ps = conn.prepareStatement(sql);
                ps.setInt(1, Integer.parseInt(billId));
                
                int rowsDeleted = ps.executeUpdate();
                if (rowsDeleted > 0) {
                    response.getWriter().write("Success");
                } else {
                    response.getWriter().write("Error: Bill not found");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}