import React from 'react';
import { Badge, StatusColor } from './Badge';

export const TagList: React.FC<{ tags: string[]; limit?: number; color?: StatusColor }> = ({ tags, limit = 99, color = 'slate' }) => (
    <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, limit).map(tag => (
            <Badge key={tag} color={color}>{tag}</Badge>
        ))}
        {tags.length > limit && <Badge color="slate">+{tags.length - limit}</Badge>}
    </div>
);
