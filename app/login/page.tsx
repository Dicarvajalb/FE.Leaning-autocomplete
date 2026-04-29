"use client";

import React from 'react';
import { ActionButton } from '../../src/components/ui';
import { openAdminLogin } from '../../src/services/quizApi';

export default function LoginPage() {
  return (
    <div className="safeArea">
      <div className="page">
        <div className="hero">
          <span className="kicker">learnning</span>
          <h1 className="title">Admin access</h1>
          <p className="subtitle">
            Sign in with Google to open the private editor and keep the public learning experience quiet and uncluttered.
          </p>
          <div className="heroButtons">
            <ActionButton label="Continue with Google" onPress={openAdminLogin} />
          </div>
        </div>
      </div>
    </div>
  );
}
