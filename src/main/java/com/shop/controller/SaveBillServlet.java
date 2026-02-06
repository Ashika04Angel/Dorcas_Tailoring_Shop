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
import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

@WebServlet("/saveBill")
public class SaveBillServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        String cid = request.getParameter("customerId");
        String totalAmount = request.getParameter("total");
        String itemsJson = request.getParameter("items");

        if (cid == null || totalAmount == null || itemsJson == null) {
            response.getWriter().write("Error: Missing parameters");
            return;
        }

        int customerId;
        double total;

        try {
            customerId = Integer.parseInt(cid);
            total = Double.parseDouble(totalAmount);
        } catch (NumberFormatException e) {
            response.getWriter().write("Error: Invalid number format");
            return;
        }

        String url = System.getenv("DB_URL");
        String dbUser = System.getenv("DB_USER");
        String dbPass = System.getenv("DB_PASS");

        if (url == null || dbUser == null || dbPass == null) {
            response.getWriter().write("Error: Database environment variables not set");
            return;
        }

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass)) {

                // 🔐 TRANSACTION START
                conn.setAutoCommit(false);

                /* --------------------
                   1️⃣ Insert into bills
                   -------------------- */
                String billSql =
                        "INSERT INTO bills (customer_id, total_amount) VALUES (?, ?)";

                PreparedStatement billPs =
                        conn.prepareStatement(billSql, PreparedStatement.RETURN_GENERATED_KEYS);

                billPs.setInt(1, customerId);
                billPs.setDouble(2, total);
                billPs.executeUpdate();

                // 🔑 Get generated bill_id
                ResultSet keys = billPs.getGeneratedKeys();
                int billId;
                if (keys.next()) {
                    billId = keys.getInt(1);
                } else {
                    conn.rollback();
                    response.getWriter().write("Error: Bill ID not generated");
                    return;
                }

                /* --------------------
                   2️⃣ Parse items JSON
                   -------------------- */
                Gson gson = new Gson();
                Type listType = new TypeToken<List<Map<String, Object>>>() {}.getType();
                List<Map<String, Object>> items =
                        gson.fromJson(itemsJson, listType);

                /* --------------------
                   3️⃣ Insert bill_items
                   -------------------- */
                String itemSql =
                        "INSERT INTO bill_items (bill_id, item_name, quantity, price) VALUES (?, ?, ?, ?)";

                PreparedStatement itemPs = conn.prepareStatement(itemSql);

                for (Map<String, Object> item : items) {
                    itemPs.setInt(1, billId);
                    itemPs.setString(2, item.get("name").toString());
                    itemPs.setInt(3, ((Double) item.get("qty")).intValue());
                    itemPs.setDouble(4, (Double) item.get("price"));
                    itemPs.addBatch();
                }

                itemPs.executeBatch();

                // ✅ COMMIT EVERYTHING
                conn.commit();
                response.getWriter().write("Success");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("Error: " + e.getMessage());
        }
    }
}
