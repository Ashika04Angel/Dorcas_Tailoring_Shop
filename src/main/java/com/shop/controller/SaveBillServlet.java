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
        // Set content type so the frontend knows how to read the response
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        try {
            // Get data from the frontend
            String cid = request.getParameter("customerId");
            String totalAmount = request.getParameter("total");
            String itemsJson = request.getParameter("items");

            // Basic validation
            if (cid == null || totalAmount == null || itemsJson == null) {
                response.getWriter().write("Error: Missing required parameters");
                return;
            }

            int customerId = Integer.parseInt(cid);
            double total = Double.parseDouble(totalAmount);

            // Database connection
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/shop_db", "root", "admin")) {
                
                String sql = "INSERT INTO bills (customer_id, total_amount, items_json) VALUES (?, ?, ?)";
                PreparedStatement ps = conn.prepareStatement(sql);
                ps.setInt(1, customerId);
                ps.setDouble(2, total);
                ps.setString(3, itemsJson);
                
                ps.executeUpdate();
                response.getWriter().write("Success");
            } 
        } catch (NumberFormatException e) {
            response.getWriter().write("Error: Invalid number format for ID or Total");
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}