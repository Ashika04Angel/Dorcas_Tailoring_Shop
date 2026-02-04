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
import java.sql.ResultSet;

@WebServlet("/getHistory")
public class GetHistoryServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String cid = request.getParameter("customerId");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try (Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/shop_db", "root", "admin")) {
            // Select id, date, total, and items
        	String sql = "SELECT id, bill_date, total_amount, items_json FROM bills WHERE customer_id = ? ORDER BY bill_date DESC";            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setInt(1, Integer.parseInt(cid));
            ResultSet rs = ps.executeQuery();

            StringBuilder json = new StringBuilder("[");
            boolean first = true;

            while (rs.next()) {
                if (!first) json.append(",");
                
                // Get values and handle potential nulls for the date
                int billId = rs.getInt("id");
                String date = rs.getString("bill_date");
                double total = rs.getDouble("total_amount");
                String items = rs.getString("items_json");

                json.append("{");
                json.append("\"id\":").append(billId).append(",");
                json.append("\"bill_date\":\"").append(date != null ? date : "No Date").append("\",");
                json.append("\"total_amount\":").append(total).append(",");
                // Append items_json directly since it's already a JSON string
                json.append("\"items_json\":").append(items != null ? items : "[]");
                json.append("}");
                first = false;
            }
            json.append("]");

            response.getWriter().write(json.toString());
        } catch (Exception e) {
            e.printStackTrace(); // This prints the REAL error in Eclipse
            response.setStatus(500);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}