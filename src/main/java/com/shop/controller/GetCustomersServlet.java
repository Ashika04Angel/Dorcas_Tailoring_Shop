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
import com.google.gson.Gson; 

@WebServlet("/getCustomers")
public class GetCustomersServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // 1. Get Cloud Connection Details
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = System.getenv("DB_URL");
            String dbUser = System.getenv("DB_USER");
            String dbPass = System.getenv("DB_PASS");
            
         // Safety check for Environment Variables
            if (url == null || dbUser == null) {
                throw new Exception("Database environment variables are not set on the server.");
            }
            

            // 2. Fetch Data using Try-with-resources
            try (Connection conn = DriverManager.getConnection(url, dbUser, dbPass);
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, name, phone, created_at FROM customers ORDER BY id DESC")) {

                List<Customer> customerList = new ArrayList<>();

                while (rs.next()) {
                    Customer c = new Customer();
                    c.setId(rs.getInt("id"));
                    c.setName(rs.getString("name"));
                    c.setPhone(rs.getString("phone"));
                    c.setDate(rs.getString("created_at")); 
                    customerList.add(c);
                }

                // 3. Convert List to JSON
                Gson gson = new Gson();
                out.print(gson.toJson(customerList));
            } 
        } 
        catch (ClassNotFoundException e) {
            response.setStatus(500);
            out.print("{\"error\":\"MySQL Driver not found in project!\"}");
        }
        catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}

// Helper Class
class Customer {
    private int id;
    private String name;
    private String phone;
    private String date;

    public void setId(int id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setDate(String date) { this.date = date; }
}