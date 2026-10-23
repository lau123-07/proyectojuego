<?php

return [

    // Accesos rápidos del inicio: ID de Steam => nombre.
    'populares' => [
        1091500 => 'Cyberpunk 2077',
        1086940 => "Baldur's Gate 3",
        730 => 'Counter-Strike 2',
        1245620 => 'Elden Ring',
        1174180 => 'Red Dead Redemption 2',
    ],

    // Juegos con FPS limitados por el propio juego (Steam no lo informa): ID de Steam => FPS máximos.
    'topes_fps' => [
        1245620 => 60, // Elden Ring
        2778580 => 60, // Elden Ring: Shadow of the Erdtree
        2622380 => 60, // Elden Ring Nightreign
        374320 => 60, // Dark Souls III
        814380 => 60, // Sekiro: Shadows Die Twice
    ],

];
