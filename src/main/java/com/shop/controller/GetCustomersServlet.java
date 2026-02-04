package com.shop.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import com.google.gson.Gson; // Ensure you have the Gson dependency in pom.xml

@WebServlet("/getCustomers")
public class GetCustomersServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // 1. Connect to MySQL
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/shop_db", "root", "admin");
            
            // 2. Fetch Data
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT id, name, phone, created_at FROM customers ORDER BY id DESC");

            List<Customer> customerList = new ArrayList<>();

            while (rs.next()) {
                Customer c = new Customer();
                c.setId(rs.getInt("id"));
                c.setName(rs.getString("name"));
                c.setPhone(rs.getString("phone"));
                c.setDate(rs.getString("created_at")); 
                customerList.add(c);
            }

            // 3. Convert List to JSON using GSON
            Gson gson = new Gson();
            String json = gson.toJson(customerList);
            out.print(json);
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}

// Simple Helper Class (Place at bottom of file or in a new file)
class Customer {
    private int id;
    private String name;
    private String phone;
    private String date;

    // Getters and Setters
    public void setId(int id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setDate(String date) { this.date = date; }
}