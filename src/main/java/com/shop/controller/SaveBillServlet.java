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

@WebServlet("/saveBill")
public class SaveBillServlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        try {
            String cid = request.getParameter("customerId");
            String totalAmount = request.getParameter("total");
            String itemsJson = request.getParameter("items");

            if (cid == null || totalAmount == null || itemsJson == null) {
                response.getWriter().write("Error: Missing required parameters");
                return;
            }

            int customerId = Integer.parseInt(cid);
            double total = Double.parseDouble(totalAmount);

            // 1. Load the Driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // 2. Use Cloud Connection Details
            String url = System.getenv("DB_URL");
            String dbUser = System.getenv("DB_USER");
            String dbPass = System.getenv("DB_PASS");
          
            try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass)) {
                
                // Matches the column names in your new SQL table
                String sql = "INSERT INTO bills (customer_id, total_amount, items_json) VALUES (?, ?, ?)";
                PreparedStatement ps = conn.prepareStatement(sql);
                ps.setInt(1, customerId);
                ps.setDouble(2, total);
                ps.setString(3, itemsJson);
                
                ps.executeUpdate();
                response.getWriter().write("Success");
            } 
        } catch (NumberFormatException e) {
            response.getWriter().write("Error: Invalid number format");
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}