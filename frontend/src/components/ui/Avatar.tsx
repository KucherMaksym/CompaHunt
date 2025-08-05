"use client"

import React from 'react';
import Image from "next/image";

interface Props {
    name: string;
    avatarUrl?: string;
    onClick?: () => void;
}

const Avatar = ({avatarUrl, onClick, name}: Props) => {
    return (
        <div onClick={onClick} className={` ${onClick ? "cursor-pointer" : "" }`}>
            {avatarUrl
                ? <Image src={avatarUrl} alt={"Avatar"} width={32} height={32} className={"rounded-full"}/>
                : <div className="rounded-full flex justify-center items-center text-primary w-[32px] h-[32px] bg-primary">{name.charAt(0)}</div>
            }

        </div>
    );
};

export default Avatar;