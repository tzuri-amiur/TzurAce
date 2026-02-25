import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function POST(req: NextRequest) {
    try {
        const { username, password, mail, name, nickname } = await req.json();

        if (!username || !password || !mail || !name || !nickname) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure data directory exists
        const dataDir = path.dirname(USERS_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Initialize file if not exists
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, JSON.stringify({}));
        }

        const fileData = fs.readFileSync(USERS_FILE, 'utf8');
        const users = JSON.parse(fileData);

        if (users[username]) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const newUser = {
            username,
            password,
            mail,
            name,
            nickname,
            createdAt: new Date().toISOString()
        };

        users[username] = newUser;

        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

        return NextResponse.json({ message: 'User registered successfully', user: { username, mail, name, nickname } }, { status: 200 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
