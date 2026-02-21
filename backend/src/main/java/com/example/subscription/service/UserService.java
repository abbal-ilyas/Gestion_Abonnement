package com.example.subscription.service;

import com.example.subscription.dto.AuthRequest;
import com.example.subscription.dto.AuthResponse;
import com.example.subscription.model.AppUser;
import com.example.subscription.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = appUserRepository
                .findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return User.withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        AppUser user = appUserRepository
                .findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        boolean validPassword = new BCryptPasswordEncoder().matches(request.password(), user.getPassword());
        if (!validPassword) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(request.username());
        return new AuthResponse(token, request.username());
    }

    public AppUser save(String username, String password, AppUser.Role role) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(new BCryptPasswordEncoder().encode(password));
        user.setRole(role);
        return appUserRepository.save(user);
    }
}
