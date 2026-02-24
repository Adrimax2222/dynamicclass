"use client";

import React from 'react';
import { ViewContainer } from '@/components/layout/view-container';
import { Wrench } from 'lucide-react';

const Game2048 = ({ onBack }: { onBack: () => void }) => {
    return (
        <ViewContainer title="2048" onBack={onBack}>
            <div className="text-center p-12 space-y-4 border-2 border-dashed rounded-lg max-w-lg mx-auto mt-8">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="font-semibold text-xl">Próximamente</h3>
                <p className="text-sm text-muted-foreground">
                    Estamos trabajando en este juego. ¡Vuelve pronto!
                </p>
            </div>
        </ViewContainer>
    );
};

export default Game2048;
