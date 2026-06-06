import { cn } from '@/lib/utils';
import React from 'react'
import { NavLink } from 'react-router-dom';
import { buttonVariants } from '../ui/button';

export default function CustomNavLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }),
                    "h-9 font-medium rounded-md px-3 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )
            }
        >
            {children}
        </NavLink>
    )
}
