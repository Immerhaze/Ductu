// auth/register-form.js

"use client";

import React from 'react';
import { SignUp } from '@stackframe/stack';

export default function RegisterForm() {

  return (
    <div className="animate-slide-in-right duration-300 delay-300">
    <SignUp
        fullPage={true}
        automaticRedirect={true}
        firstTab='password'
        extraInfo={<>Al inscribirte, aceptas nuestros <a href="/terms">terminos.</a></>}
        />
    </div>

  );
}