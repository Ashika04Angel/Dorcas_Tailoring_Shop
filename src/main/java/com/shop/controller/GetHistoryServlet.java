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

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String cid = request.getParameter("customerId");

        // ✅ 1. Validate request parameter
        if (cid == null || !cid.matches("\\d+")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"Invalid customerId\"}");
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
            // ✅ 4. Load MySQL driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            String sql =
                "SELECT id, bill_date, total_amount, items_json " +
                "FROM bills " +
                "WHERE customer_id = ? " +
                "ORDER BY bill_date DESC";

            // ✅ 5. Use try-with-resources for ALL DB objects
            try (
                Connection conn = DriverManager.getConnection(url, dbUser, dbPass);
                PreparedStatement ps = conn.prepareStatement(sql)
            ) {
                ps.setInt(1, Integer.parseInt(cid));

                try (ResultSet rs = ps.executeQuery()) {

                    StringBuilder json = new StringBuilder("[");
                    boolean first = true;

                    while (rs.next()) {
                        if (!first) json.append(",");

                        int billId = rs.getInt("id");
                        String date = rs.getString("bill_date");
                        double total = rs.getDouble("total_amount");
                        String items = rs.getString("items_json");

                        json.append("{");
                        json.append("\"id\":").append(billId).append(",");
                        json.append("\"bill_date\":\"")
                            .append(date != null ? date : "No Date")
                            .append("\",");
                        json.append("\"total_amount\":").append(total).append(",");
                        json.append("\"items_json\":")
                            .append((items != null && !items.isEmpty()) ? items : "[]");
                        json.append("}");

                        first = false;
                    }

                    json.append("]");
                    response.getWriter().write(json.toString());
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
