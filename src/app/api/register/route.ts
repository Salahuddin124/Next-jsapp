import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import axios from "axios"; // Import axios for making HTTP requests

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return new NextResponse("Missing Info", { status: 400 });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Make a POST request to your Node.js server's registration endpoint
    const response = await axios.post("https://messengerclone-production.up.railway.app/api/users/register", {
      email,
      name,
      password: password, 
    });

    // Assuming your server responds with the registered user data upon successful registration
    const userData = response.data;

    console.log(userData)
    return NextResponse.json(userData);
  } catch (error: any) {
    console.error("Registration error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
