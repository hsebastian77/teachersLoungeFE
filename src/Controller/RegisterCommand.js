import { apiUrl, registerRoute } from "@env";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  upper: /[A-Z]/,
  number: /[0-9]/,
  symbol: /[^A-Za-z0-9]/,
};

const safeParseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    return { message: text };
  }
};

async function register(fName, lName, username, email, password) {
  if (!fName || !lName || !username || !email || !password) {
    return { ok: false, message: "Fields cannot be blank" };
  }

  // Email validation
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  // Password validation
  if (
    password.length < PASSWORD_REQUIREMENTS.minLength ||
    !PASSWORD_REQUIREMENTS.upper.test(password) ||
    !PASSWORD_REQUIREMENTS.number.test(password) ||
    !PASSWORD_REQUIREMENTS.symbol.test(password)
  ) {
    return {
      ok: false,
      message:
        "Password must be at least 8 characters and include a capital letter, a number, and a symbol.",
    };
  }

  const urlRegister = apiUrl + registerRoute;

  try {
    const response = await fetch(urlRegister, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: fName,
        lastName: lName,
        username,
        email,
        password,
        role: "Approved",
      }),
    });

    const data = await safeParseJson(response);

    if (response.status !== 200) {
      return {
        ok: false,
        message: data.message || "Failed to register",
      };
    }

    return {
      ok: true,
      message: "Account Created!",
    };

  } catch (error) {
    return {
      ok: false,
      message: `Unable to connect to server at ${apiUrl}. Please check your connection.`,
    };
  }
}

export { register };