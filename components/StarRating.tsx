import React, { useState } from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center space-x-1 mt-1">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button"
                        key={starValue}
                        className={`transition-colors duration-200 ${
                            starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                        onClick={() => onRatingChange(starValue)}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                        aria-label={`Rate ${starValue} star`}
                    >
                        <StarIcon className="w-6 h-6" />
                    </button>
                );
            })}
        </div>
    );
};
