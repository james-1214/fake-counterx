package com.CounterX.Controller;

import com.CounterX.dto.CartDTO;
import com.CounterX.entity.Cart;
import com.CounterX.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Cart Management Controller
 * Handles shopping cart operations for customers
 * 
 * Base Path: /api/cart
 */
@RestController
@RequestMapping("/api/cart")  // ✅ FIXED: Added /api prefix for consistency
@CrossOrigin("*")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Add items to cart
     * @param dto CartDTO containing cart items and customer details
     * @return Created cart entity
     */
    @PostMapping
    public Cart addCart(
            @RequestBody CartDTO dto) {

        return cartService.addCart(dto);
    }

    /**
     * Get specific cart by ID
     * @param cartId Cart identifier
     * @return Cart with all items
     */
    @GetMapping("/{cartId}")
    public Cart getCart(
            @PathVariable Long cartId) {

        return cartService.getCart(cartId);
    }

    /**
     * Get all carts (Admin view)
     * @return List of all carts
     */
    @GetMapping
    public List<Cart> getAllCarts() {

        return cartService.getAllCarts();
    }

    /**
     * Delete/Clear cart
     * @param cartId Cart identifier to delete
     * @return Success message
     */
    @DeleteMapping("/{cartId}")
    public String deleteCart(
            @PathVariable Long cartId) {

        cartService.deleteCart(cartId);

        return "Cart Deleted Successfully";
    }
}