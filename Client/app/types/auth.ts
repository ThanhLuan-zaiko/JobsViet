export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  name: string;
}

export interface UserDto {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user?: UserDto;
  message: string;
  messageType: "success" | "error" | "warning" | "info";
}

export interface NotificationType {
  message: string;
  type: "success" | "error" | "warning" | "info";
}
