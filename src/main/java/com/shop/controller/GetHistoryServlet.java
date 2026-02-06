package com.shop.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.*;

@WebServlet("/getHistory")
public class GetHistoryServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String cid = request.getParameter("customerId");

        // 1️⃣ Validate input
        if (cid == null || !cid.matches("\\d+")) {
            response.getWriter().write("[]");
            return;
        }

        String url = System.getenv("DB_URL");
        String dbUser = System.getenv("DB_USER");
        String dbPass = System.getenv("DB_PASS");

        if (url == null || dbUser == null || dbPass == null) {
            response.getWriter().write("[]");
            return;
        }

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            String sql =
                "SELECT id, bill_date, total_amount, items_json " +
                "FROM bills " +
                "WHERE customer_id = ? " +
                "ORDER BY bill_date DESC";

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

                        json.append("{")
                            .append("\"id\":").append(rs.getInt("id")).append(",")

                            // ✅ MATCH FRONTEND FIELD NAMES
                            .append("\"bill_date\":\"")
                            .append(rs.getTimestamp("bill_date"))
                            .append("\",")

                            .append("\"total_amount\":")
                            .append(rs.getDouble("total_amount"))
                            .append(",")

                            .append("\"items_json\":")
                            .append(
                                rs.getString("items_json") != null
                                    ? rs.getString("items_json")
                                    : "[]"
                            )
                            .append("}");

                        first = false;
                    }

                    json.append("]");
                    response.getWriter().write(json.toString());
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("[]");
        }
    }
}
