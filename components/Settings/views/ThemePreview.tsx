
import React from 'react';
import { Card, Button, Badge, ProgressBar } from '../../Shared/UI';

export const ThemePreview: React.FC = () => {
    return (
        <Card className="p-6 space-y-4">
            <div className="font-bold text-lg text-[var(--colors-textPrimary)]">Live Preview</div>
            <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-2">
                <Badge color="blue">Blue</Badge>
                <Badge color="green">Green</Badge>
                <Badge color="orange">Orange</Badge>
                <Badge color="red">Red</Badge>
                <Badge color="purple">Purple</Badge>
            </div>
            <Card className="p-4 border-l-4 border-l-[var(--colors-primary)]">
                <h4 className="font-bold text-[var(--colors-textPrimary)]">Sample Card</h4>
                <p className="text-xs text-[var(--colors-textSecondary)] mt-1">This is a sample card with a primary accent.</p>
                <ProgressBar value={65} color="primary" className="mt-4" />
            </Card>
        </Card>
    );
};
