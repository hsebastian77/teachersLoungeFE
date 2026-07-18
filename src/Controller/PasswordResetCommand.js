import { apiUrl } from "@env";

const REQUEST_RESET_ROUTE = "/password-reset/request";
const CONFIRM_RESET_ROUTE = "/password-reset/confirm";

const safeParseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    return { message: text };
  }
};

async function requestPasswordReset(email) {
  if (!email || !email.trim()) {
    return { ok: false, message: "Email is required." };
  }

  try {
    const response = await fetch(`${apiUrl}${REQUEST_RESET_ROUTE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await safeParseJson(response);

    if (!response.ok) {
      return {
        ok: false,
        message: data.message || "Unable to request a reset link.",
      };
    }

    return {
      ok: true,
      message:
        data.message ||
        "If an account with that email exists, a password reset code has been sent.",
    };
  } catch (error) {
    return {
      ok: false,
      message: `Unable to connect to server at ${apiUrl}.`,
    };
  }
}

async function confirmPasswordReset({ code, newPassword, email }) {
  if (!email || !email.trim()) {
    return { ok: false, message: "Email is required." };
  }

  if (!code || !code.trim()) {
    return { ok: false, message: "Reset code is required." };
  }

  if (!/^\d{6}$/.test(code.trim())) {
    return { ok: false, message: "Reset code must be 6 digits." };
  }

  if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
    return { ok: false, message: "Password must be at least 8 characters long." };
  }

  const payload = {
    email: email.trim(),
    code: code.trim(),
    newPassword,
  };

  try {
    const response = await fetch(`${apiUrl}${CONFIRM_RESET_ROUTE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await safeParseJson(response);

    if (!response.ok) {
      return {
        ok: false,
        message: data.message || "Invalid or expired reset code.",
      };
    }

    return {
      ok: true,
      message: data.message || "Password reset successful",
    };
  } catch (error) {
    return {
      ok: false,
      message: `Unable to connect to server at ${apiUrl}.`,
    };
  }
}

export { requestPasswordReset, confirmPasswordReset };
