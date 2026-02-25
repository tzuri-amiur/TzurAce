import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
        }

        if (!fs.existsSync(USERS_FILE)) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const fileData = fs.readFileSync(USERS_FILE, 'utf8');
        const users = JSON.parse(fileData);

        const user = users[username];

        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
        }

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
