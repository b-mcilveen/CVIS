import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export class ColourPicker {
    private static _instance: ColourPicker;

    private chosenColours: string[] = [];

    private constructor() {
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    private randomColour(): Colour {
        const colours: Colour[] = [
            // Red
            "bg-red-200 text-black",
            "bg-red-300 text-black",
            "bg-red-400 text-white",
            "bg-red-500 text-white",
            "bg-red-600 text-white",
            "bg-red-700 text-white",
            "bg-red-800 text-white",

            // Orange
            "bg-orange-200 text-black",
            "bg-orange-300 text-black",
            "bg-orange-400 text-white",
            "bg-orange-500 text-white",
            "bg-orange-600 text-white",
            "bg-orange-700 text-white",
            "bg-orange-800 text-white",

            // Amber
            "bg-amber-200 text-black",
            "bg-amber-300 text-black",
            "bg-amber-400 text-white",
            "bg-amber-500 text-white",
            "bg-amber-600 text-white",
            "bg-amber-700 text-white",
            "bg-amber-800 text-white",

            // Yellow
            "bg-yellow-200 text-black",
            "bg-yellow-300 text-black",
            "bg-yellow-400 text-white",
            "bg-yellow-500 text-white",
            "bg-yellow-600 text-white",
            "bg-yellow-700 text-white",
            "bg-yellow-800 text-white",

            // Lime
            "bg-lime-200 text-black",
            "bg-lime-300 text-black",
            "bg-lime-400 text-white",
            "bg-lime-500 text-white",
            "bg-lime-600 text-white",
            "bg-lime-700 text-white",
            "bg-lime-800 text-white",

            // Green
            "bg-green-200 text-black",
            "bg-green-300 text-black",
            "bg-green-400 text-white",
            "bg-green-500 text-white",
            "bg-green-600 text-white",
            "bg-green-700 text-white",
            "bg-green-800 text-white",

            // Emerald
            "bg-emerald-200 text-black",
            "bg-emerald-300 text-black",
            "bg-emerald-400 text-white",
            "bg-emerald-500 text-white",
            "bg-emerald-600 text-white",
            "bg-emerald-700 text-white",
            "bg-emerald-800 text-white",
        ]

        return colours[Math.floor(Math.random() * colours.length)];
    }

    public pickColour(): string {
        let colourOption: Colour;
        do {
            colourOption = this.randomColour();
        } while (this.chosenColours.includes(colourOption));
        return colourOption;
    }

}


// Tailwind scans files and doesn't like constructing these .... :(
type Colour =
// Red
    "bg-red-200 text-black" |
    "bg-red-300 text-black" |
    "bg-red-400 text-white" |
    "bg-red-500 text-white" |
    "bg-red-600 text-white" |
    "bg-red-700 text-white" |
    "bg-red-800 text-white" |

    // Orange
    "bg-orange-200 text-black" |
    "bg-orange-300 text-black" |
    "bg-orange-400 text-white" |
    "bg-orange-500 text-white" |
    "bg-orange-600 text-white" |
    "bg-orange-700 text-white" |
    "bg-orange-800 text-white" |

    // Amber
    "bg-amber-200 text-black" |
    "bg-amber-300 text-black" |
    "bg-amber-400 text-white" |
    "bg-amber-500 text-white" |
    "bg-amber-600 text-white" |
    "bg-amber-700 text-white" |
    "bg-amber-800 text-white" |

    // Yellow
    "bg-yellow-200 text-black" |
    "bg-yellow-300 text-black" |
    "bg-yellow-400 text-white" |
    "bg-yellow-500 text-white" |
    "bg-yellow-600 text-white" |
    "bg-yellow-700 text-white" |
    "bg-yellow-800 text-white" |

    // Lime
    "bg-lime-200 text-black" |
    "bg-lime-300 text-black" |
    "bg-lime-400 text-white" |
    "bg-lime-500 text-white" |
    "bg-lime-600 text-white" |
    "bg-lime-700 text-white" |
    "bg-lime-800 text-white" |

    // Green
    "bg-green-200 text-black" |
    "bg-green-300 text-black" |
    "bg-green-400 text-white" |
    "bg-green-500 text-white" |
    "bg-green-600 text-white" |
    "bg-green-700 text-white" |
    "bg-green-800 text-white" |

    // Emerald
    "bg-emerald-200 text-black" |
    "bg-emerald-300 text-black" |
    "bg-emerald-400 text-white" |
    "bg-emerald-500 text-white" |
    "bg-emerald-600 text-white" |
    "bg-emerald-700 text-white" |
    "bg-emerald-800 text-white" |

    // Teal
    "bg-teal-200 text-black" |
    "bg-teal-300 text-black" |
    "bg-teal-400 text-white" |
    "bg-teal-500 text-white" |
    "bg-teal-600 text-white" |
    "bg-teal-700 text-white" |
    "bg-teal-800 text-white" |

    // Cyan
    "bg-cyan-200 text-black" |
    "bg-cyan-300 text-black" |
    "bg-cyan-400 text-white" |
    "bg-cyan-500 text-white" |
    "bg-cyan-600 text-white" |
    "bg-cyan-700 text-white" |
    "bg-cyan-800 text-white" |

    // Sky
    "bg-sky-200 text-black" |
    "bg-sky-300 text-black" |
    "bg-sky-400 text-white" |
    "bg-sky-500 text-white" |
    "bg-sky-600 text-white" |
    "bg-sky-700 text-white" |
    "bg-sky-800 text-white" |

    // Blue
    "bg-blue-200 text-black" |
    "bg-blue-300 text-black" |
    "bg-blue-400 text-white" |
    "bg-blue-500 text-white" |
    "bg-blue-600 text-white" |
    "bg-blue-700 text-white" |
    "bg-blue-800 text-white" |

    // Indigo
    "bg-indigo-200 text-black" |
    "bg-indigo-300 text-black" |
    "bg-indigo-400 text-white" |
    "bg-indigo-500 text-white" |
    "bg-indigo-600 text-white" |
    "bg-indigo-700 text-white" |
    "bg-indigo-800 text-white" |

    // Violet
    "bg-violet-200 text-black" |
    "bg-violet-300 text-black" |
    "bg-violet-400 text-white" |
    "bg-violet-500 text-white" |
    "bg-violet-600 text-white" |
    "bg-violet-700 text-white" |
    "bg-violet-800 text-white" |

    // Purple
    "bg-purple-200 text-black" |
    "bg-purple-300 text-black" |
    "bg-purple-400 text-white" |
    "bg-purple-500 text-white" |
    "bg-purple-600 text-white" |
    "bg-purple-700 text-white" |
    "bg-purple-800 text-white" |

    // Fuchsia
    "bg-fuchsia-200 text-black" |
    "bg-fuchsia-300 text-black" |
    "bg-fuchsia-400 text-white" |
    "bg-fuchsia-500 text-white" |
    "bg-fuchsia-600 text-white" |
    "bg-fuchsia-700 text-white" |
    "bg-fuchsia-800 text-white" |

    // Pink
    "bg-pink-200 text-black" |
    "bg-pink-300 text-black" |
    "bg-pink-400 text-white" |
    "bg-pink-500 text-white" |
    "bg-pink-600 text-white" |
    "bg-pink-700 text-white" |
    "bg-pink-800 text-white" |

    // Rose
    "bg-rose-200 text-black" |
    "bg-rose-300 text-black" |
    "bg-rose-400 text-white" |
    "bg-rose-500 text-white" |
    "bg-rose-600 text-white" |
    "bg-rose-700 text-white" |
    "bg-rose-800 text-white" |

    // Slate
    "bg-slate-200 text-black" |
    "bg-slate-300 text-black" |
    "bg-slate-400 text-white" |
    "bg-slate-500 text-white" |
    "bg-slate-600 text-white" |
    "bg-slate-700 text-white" |
    "bg-slate-800 text-white" |

    // Gray
    "bg-gray-200 text-black" |
    "bg-gray-300 text-black" |
    "bg-gray-400 text-white" |
    "bg-gray-500 text-white" |
    "bg-gray-600 text-white" |
    "bg-gray-700 text-white" |
    "bg-gray-800 text-white" |

    // Zinc
    "bg-zinc-200 text-black" |
    "bg-zinc-300 text-black" |
    "bg-zinc-400 text-white" |
    "bg-zinc-500 text-white" |
    "bg-zinc-600 text-white" |
    "bg-zinc-700 text-white" |
    "bg-zinc-800 text-white" |

    // Neutral
    "bg-neutral-200 text-black" |
    "bg-neutral-300 text-black" |
    "bg-neutral-400 text-white" |
    "bg-neutral-500 text-white" |
    "bg-neutral-600 text-white" |
    "bg-neutral-700 text-white" |
    "bg-neutral-800 text-white" |

    // Stone
    "bg-stone-200 text-black" |
    "bg-stone-300 text-black" |
    "bg-stone-400 text-white" |
    "bg-stone-500 text-white" |
    "bg-stone-600 text-white" |
    "bg-stone-700 text-white" |
    "bg-stone-800 text-white";