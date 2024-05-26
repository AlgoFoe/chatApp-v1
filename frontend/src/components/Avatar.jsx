import React from 'react'

function Avatar({username,userId,online}) {
    const colors = ['bg-sky-600','bg-zinc-700','bg-gray-500','bg-red-400','bg-orange-400','bg-lime-500','bg-green-400','bg-emerald-400','bg-teal-400','bg-blue-400','bg-purple-400','bg-pink-400'];
    const userIdInt = parseInt(userId,16);
    const colorIndex = userIdInt%colors.length;
    const color = colors[colorIndex];
    return (
        <div className={`w-9 h-9 relative ${color} rounded-full flex items-center`}>
            <div className='text-center w-full text-white'>{username[0].toUpperCase()}</div>
            {online && (
                <div className='absolute w-3 h-3 bg-[#08ff08] bottom-0 right-0 rounded-full border border-white'></div>
            )}
            {!online && (
                <div className='absolute w-3 h-3 bg-[#71717a] bottom-0 right-0 rounded-full border border-white'></div>
            )}
        </div>
    )
}
export default Avatar
