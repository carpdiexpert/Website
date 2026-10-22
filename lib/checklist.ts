const checklist = [

    /* ================= ENGINE ASSEMBLY ================= 
                {
                text: "Intercooler: Check for damage / leaks",
                notFor: ["Petrol", "CNG"]
            },
    */
    {
        section: "Engine Assembly",
        startNo: 1,
        items: [
            "Engine Assembly: Check for overhaul",
            "Engine: Check for misfiring",
            "Engine: Abnormal noise",
            "Engine: Check for overheating",
            "Engine: Poor acceleration",
            "Engine: Starting issues",
            "Engine: Check for blue, grey & white smoke",
            "Engine: Check for rough idling",
            "Engine: Back compression",
            "Engine: Check for tappet noise",
            "Engine: Check for timing noise",
            "Engine: Check engine control module",
            "Engine: Check for engine number mismatch",
            "Engine: Check oil level",
            "Engine: check oil quality",
            "Engine: Oil sludge & water contamination",
            "Engine Mounts: Check for cracks, leaks & abnormal vibrations",
            "Engine Oil Pump: Check for functionality",
            "Engine Gaskets & Seals: Check for leaks",
            "Engine Gasket & Seals: check for seepage",
            "Engine Head gasket: check for leaks",
            "Engine Head gasket: check for damage",
            "Engine Oil sump: check for damage",
            "Engine Oil sump: check for leaks",
            "Engine oil sump: Check for seepage",
            "Engine Pulleys: Check for damage",
            "Engine pulley: Abnormal noise",
            "Engine V-Belt / Serpentine Belt: Check for damage",
            "Engine V-Belt / Serpentine Belt: Abnormal noise",
            "Engine Sensors: Check for functionality",
            "Engine Sensors: Check for damage",
            "Vacuum Lines & Hoses: Check for leaks",
            "Vacuum Pump: Check for leaks",
            "Vacuum Modulator: Check for leaks",
            "Engine compartment: check for rat movement",
            "Engine ubderbody cover: Check for damage and missing"
        ]
    },

    /* ================= ENGINE COOLING SYSTEM ================= */
    {
        section: "Engine Cooling System",
        startNo: 37,
        items: [
            "Cooling System: Check for corrosion",
            "Cooling System: Check for coolant quality",
            "Cooling System ystem: Coolant level",
            "Cooling System: oil contamination",
            "Radiator: Check for damage",
            "Radiator: Check for leaks",
            "Radiator Fan: Check for abnormal noise",
            "Radiator Fan: Check for damage",
            "Water Pump: Check for abnormal noise",
            "Water Pump: leaks",
            "Oil Cooler: Check for damage",
            "Oil Cooler: Check for leaks",
            "Thermostat: Check for functionality",
            "Thermostat: Check for leaks"
        ]
    },

    /* ================= AIR INTAKE SYSTEM ================= */
    {
        section: "Air Intake System",
        startNo: 51,
        items: [
            "Air Filter: Check for unclean / dirty filter",
            "Air filter body: Check for Damage",
            "Air Filter body: Check for abnormal noise",
            "Intake Manifold: Check for cracks and leaks",
            "EVAP System: Check for damage / leaks",
            "Hoses: Check for leaks",
            "Hoses: Check for damage",
            {
                text: "Intercooler: Check for damage",
                notFor: ["Petrol", "CNG"]
            },
            {
                text: "Intercooler: Check for leaks",
                notFor: ["Petrol", "CNG"]
            },
            "Air Intake Sensors: Check for functionality",
            "Throttle Body: Check for functionality"
        ]
    },

    /* ================= IGNITION SYSTEM ================= */
    {
        section: "Ignition System",
        startNo: 62,
        items: [
            "Alternator: Check for abnormal noise",
            "Battery: Check for bulges",
            "Battery: Leaks",
            "Battery: Incorrect size",
            "Battery: Low voltage",
            "Battery: Long cranking",
            "Battery: Overall Health",
            "Battery Terminals: Check for corrosion / cracks",
            "Battery Bracket,Rod & Bolts: Check for fittings",
            "Fuses & Relays: Check for blown fuses and relays",
            {
                text: "Ignition Coil: Check for functionality",
                notFor: ["Diesel"]
            },
            {
                text: "Spark Plugs: Check for functionality",
                notFor: ["Diesel"]
            },
            "Glow Plugs: Check for functionality",
            "Starter Motor: Check for abnormal noise",
            "Wiring Harness: Check for cuts & loose connections",
            "Wiring Harness: Check for wiring harness repair and tampered"
        ]
    },

    /* ================= EXHAUST SYSTEM ================= */
    {
        section: "Exhaust System",
        startNo: 78,
        items: [
            "Catalytic Converter: Check for damage / leaks",
            {
                text: "DPF: Check for damage / leaks",
                notFor: ["Petrol", "CNG"]
            },
            "EGR: Check for damage / leaks",
            "Exhaust Sensors: Check for functionality",
            "Tailpipe: Check for bends",
            "Tailpipe: corrosion",
            "Tailpipe: cracks & leaks",
            "Tailpipe: Check for abnormal noise",
            "Muffler: Check for damage and corrosion",
            "Turbocharger: Check for leaks",
            "Turbocharger: whistling noise",
            "Heat Shield: Check for damage",
            "Heat Shield Locks: Check for damage and missing"
        ]
    },

    /* ================= FUEL SUPPLY SYSTEM ================= */
    {
        section: "Fuel Supply System",
        startNo: 91,
        items: [
            "Fuel Filter: Check for damage / leaks",
            "Fuel Injectors: Check for damages",
            "Fuel injector: leaks or abnormal noise",
            "Fuel Lid & Cap: Check for damage / leaks",
            "Fuel Lines & Rails: Check for leaks",
            "Fuel Pump: Check for leaks",
            "Fuel Tank: Check for leaks",
            "Fuel Tank: Check for corrosion",
            "Fuel Tank: Check for repaired",
            "Fuel Tank: dents",
            {
                text: "CNG Fuel Valve: Check for damage",
                notFor: ["Petrol", "Diesel"]
            },
            {
                text: "CNG Fuel Valve: Check for leaks",
                notFor: ["Petrol", "Diesel"]
            },
            {
                text: "CNG Lines & Tank: Check for damage",
                notFor: ["Petrol", "Diesel"]
            },
            {
                text: "CNG Lines & Tank: Check for leaks",
                notFor: ["Petrol", "Diesel"]
            },
            {
                text: "CNG Tank: Check tank number",
                notFor: ["Petrol", "Diesel"]
            },
            {
                text: "CNG Compliance Plate: Check availability",
                notFor: ["Petrol", "Diesel"]
            },
            {
                text: "CNG System: Check fuel switch mode functionality",
                notFor: ["Petrol", "Diesel"]
            },
        ]
    },

    /* ================= TRANSMISSION ASSEMBLY ================= */
    {
        section: "Transmission Assembly",
        startNo: 108,
        items: [
            "Gearbox assembly: Check for overhaul",
            "Gearbox Housing (clutch bell housing): Check for damages",
            "Gearbox main housing: Check for damages",
            "Transmission Gaskets & Seals: Check for leaks",
            "Gear Lever: Check for hardness",
            "Gear lever: Check for slippage",
            "Gear Lever: Check for play",
            "Gear level knob: Check for damage",
            "Transmission Oil Pump: Check for functionality",
            "Gearbox: Check for abnormal noise"
        ]
    },

    /* ================= FINAL DRIVE ================= */
    {
        section: "Final Drive",
        startNo: 118,
        items: [
            "Differentials: Check for damage",
            "Differentials: Check for leaks",
            "Drive Axles: Check for bends",
            "Drive Axles: Check for abnormal noise",
            "Drive Axles Boot: Check for damage",
            "Drive Axles seals: Check for leakage",
            "Propeller Shaft: Check for bends",
            "Propeller shaft: Check for abnormal noise",
            "Transfer Case: Check for damage",
            "Transfer case: Check for leaks",
            "Transfer case: Check for abnormal noise"
        ]
    },

    /* ================= CLUTCH ASSEMBLY ================= */
    {
        section: "Clutch Assembly",
        startNo: 129,
        items: [
            {
                text: "Clutch: Check for juddering",
                notFor: ["Automatic"]
            },
            {
                text: "Clutch: Check for vibration",
                notFor: ["Automatic"]
            },
            {
                text: "Clutch: Check for hardness",
                notFor: ["Automatic"]
            },
            {
                text: "Clutch: Check for sponginess & slippage",
                notFor: ["Automatic"]
            },
            "Flywheel: Check for abnormal noise",
            "Pilot Bearing: Check for abnormal noise",
            "Release Bearing: Check for abnormal noise",
            "Master & Slave Cylinder: Check for damage / leaks"
        ]
    },

    /* ================= BODY STRUCTURE ================= */
    {
        section: "Body Structure",
        startNo: 137,
        items: [
            "Floor Panels: Check for cracks & bends",
            "Floor panels: check for corrosion",
            "Floor panels: Check for accidental repair, punch repaired",
            "Floor panels: Check for Replaced",
            "Legs: Check for cracks & bends",
            "Legs: Check for corrosion",
            "Legs: Check for accidental repair, punch repaired",
            "Legs: Check for Replaced",
            "Cowl Top: Check for cracks & bends",
            "Cowl Top: Check for corrosion",
            "Cowl Top: Check for accidental repair, punch repaired",
            "Cowl Top: Check for Replaced",
            "Wheel Houses: Check for cracks & bend",
            "Wheel Houses: Check for corrosion",
            "Wheel Houses: Check for accidental repair, punch repaired",
            "Wheel House: Check for Replaced",
            "Firewall: Check for cracks & bends",
            "Firewall: Check for corrosion",
            "Firewall: Check for accidental repair, punch repaired",
            "Firewall: Check for Replaced",
            "Apron Sidewalls: Check for cracks & bends",
            "Apron sidewalls: check for corrosion",
            "Apron sidewalls: Check for accidental repair, punch repaired",
            "Apron sidewall: Check for Replaced",
            "Apron Strut Towers: Check for corrosion",
            "Apron Strut Towers: Check for cracks & bends",
            "Apron Strut Towers: Check for accidental repair, punch repaired",
            "Apron Strut Towers: Check for Replaced",
            "Right side pillars (A,B,C,D): Check for cracks & bend",
            "Right side pillars: Check for corrosion, scratches & dent",
            "Right side pillars: Check for Repainted.",
            "Right side pillars: Check for accidental repair, punch repaired",
            "Right side pillars: Check for Replaced",
            "Left side pillars: Check for crack & bend",
            "Left side pillars: Check for corrosion, scratches & dent",
            "Left side pillars: Check for Repainted",
            "Left side pillars: Check for accidental repair, punch repaired",
            "Left side pillars: Check for Replaced",
            "Dickey Floor: Check for cracks & bends",
            "Dickey Floor: Check for corrosion",
            "Dickey Floor: Check for accidental repair, punch repaired",
            "Dickey Floor: Check for Replaced",
            "Dickey Back Panel: Check for cracks & bend",
            "Dickey back panel: Check for corrosion & sealant crack",
            "Dickey back panel: Check for accidental repair, punch repaired",
            "Dickey back panel: Check for Replaced",
            "Dickey Firewall: Check for cracks & bend",
            "Dickey firewall: Check for corrosion",
            "Dickey firewall: Check for accidental repair, punch repaired",
            "Dickey firewall: Check for Replaced",
            "Dickey Sidewalls: Check for cracks & bends",
            "Dickey Sidewalls: Check for accidental repair, punch repaired",
            "Dickey Sidewalls: Check for Replaced",
            "Dickey Sidewalls: Check for corrosion",
            "Dickey Strut Towers: Check for cracks & bend",
            "Dickey Strut Towers: Check for corrosion",
            "Dickey Strut Towers: Check for accidental repair, punch repaired",
            "Dickey Strut Towers: Check for Replaced",
            "Radiator Support: Check for cracks & bend",
            "Radiator Support: Check for corrosion",
            "Radiator Support: Check for accidental repair, punch repaired",
            "Radiator Support: Check for Replaced",
            "Radiator fiber support: Check for crack and repaired",
            "Radiator bolted support: Check for crack, bend",
            "Radiator Bolted Support: Check for Repaired",
            "Roof: Check for Repainted",
            "Roof: Check for cracks & bent",
            "Roof: Check for scratches, corrosion & dents",
            "Roof: Check for accidental repair, punch repaired",
            "Roof: Check for Replaced",
            "Door channels: Check for accidental repaired, punch repaired",
            "Door channels: Check for cracks and bend",
            "Door channels: Check for corrosion"
        ]
    },

    /* ================= EXTERIOR BODY PANELS ================= */
    {
        section: "Exterior Body Panels",
        startNo: 210,
        items: [
            "Doors: Check for alignment issues",
            "Doors: Check for repainted",
            "Doors: Check for paint defects and paint mismatch",
            "Doors: Check for corrosion and sealant repaired",
            "Doors: Check for scratches & dents",
            "Doors: Check for Replaced",
            "Fenders: Check for alignment issues",
            "Fenders: Check for repainted",
            "Fenders: Check for corrosion",
            "Fenders: Check for scratches and dents",
            "Fenders: Check for paint defects and paint mismatch",
            "Fenders: Check for Replaced",
            "Bonnet: Check for alignment issues",
            "Bonnet: Check for repainted",
            "Bonnet: Check for corrosion and sealent Repaired",
            "Bonnet: Check for scratches and dents",
            "Bonnet: Check for paint mismatch & paint defect",
            "Bonnet: Check for Replaced",
            "Dickey Door: Check for alignment issues",
            "Dickey door: Check for corrosion and sealent Repaired",
            "Dickey door: Check for repainted",
            "Dickey door: Check for scratches and dents",
            "Dickey door: Check for paint mismatch & paint defects",
            "Dickey door: Check for Replaced",
            "Running Boards: Check for alignment issues",
            "Running boards: Check for accidental repair, punch repaired",
            "Running boards: Check for Replaced",
            "Running boards: Check for corrosion",
            "Running boards: Check for cracks and bend",
            "Running boards: Check for scratches and dents",
            "Running boards: Check for repainted",
            "Quarter Panels: Check for alignment issues",
            "Quarter panel: paint mismatch & paint defects",
            "Quarter Panels: Check for corrosion",
            "Quarter Panels: Check for repainted",
            "Quarter Panels: Check for accidental repair, punch repaired",
            "Quarter Panels: Check for Replaced",
            "Quarter Panels: Check for scratches and dents",
            "Bumpers: Check for alignment issues",
            "Bumpers: Check for paint mismatch & paint defects",
            "Bumpers: Check for scratches",
            "Bumpers: Check for repainted",
            "Body Panels: Check for Watermarks and cleaning"
        ]
    },

    /* ================= EXTERIOR FITMENTS ================= */
    {
        section: "Exterior Fitments",
        startNo: 253,
        items: [
            "Hinges: Check for abnormal noise, corrosion & dust accumulation",
            "Door Handles: Check for damage & functionality",
            "Door handles: Check for request sensor Functionality",
            "Grills: Check for bends, cracks, dents & scratches",
            "Grills: Check for alignment issue",
            "Antenna: Check functionality and damage",
            "Door Seals & Beedings: Check for damage",
            "Claddings: Check for scratches",
            "Claddings: Check for alignment issue",
            "Foglights: Check for cracks & moisture ingress",
            "Foglights: Check for scratches",
            "Headlights & DRL: Check for cracks & moisture ingress",
            "Headlights & DRL: Check for scratches",
            "Headlights & DRL: Check for alignment issue",
            "Reverse Parking Lights: Check for cracks & moisture ingress",
            "Taillights: Check for cracks & moisture ingress",
            "Taillights: Check for scratches",
            "Taillights: Check for alignment issue",
            "Turn Indicators: Check for cracks & moisture ingress",
            "Dickey Door Emblems: Check for damage",
            "Dickey Struts: Check for leaks",
            "Dickey Struts: Check for Functionality",
            "Windshield Washer: Check fluid level",
            "Windshield washer tank: Check for damage and leaks",
            "Windshield washer: Check for spray settings",
            "Wipers: Check for abnormal noise and damage",
            "Wiper Arms: Check damage and missing",
            "Sunroof: Check for Water Leakage",
            "Sunroof: Check for Damage",
            "Sunroof: Check for noise",
            "Sunroof: Check for Glass Damage",
            "Fender lining: Check for Damage",
            "Cowl Top Cover: Check for Damage",
            "All Exterior Light: Check for Functionality"
        ]
    },

    /* ================= GLASSES & MIRRORS ================= */
    {
        section: "Glasses & Mirrors",
        startNo: 287,
        items: [
            "Rear defogger: Check for damage & functionality",
            "Side View Mirrors: Check for damage",
            "Side view Mirrors cover: Check for scratches and damage",
            "Side view Mirrors indicator: Check for damage",
            "Window Glasses: Check for damage",
            "Quarter glasses: Check for damage",
            "Windshields: Check for chips, cracks & scratches",
            "Windshields: Check for replacement"
        ]
    },

    /* ================= INTERIOR SAFETY ================= */
    {
        section: "Interior Safety",
        startNo: 295,
        items: [
            "Buttons & Switches: Check for damage & functionality",
            "Steering mounted controls:Check for damage & functionality",
            "Display Screen: Check for damage & functionality",
            "Speakers & Tweeters: Check for functionality",
            "AC Compressor: Check for damage & abnormal noise",
            "AC Condenser: Check for damage / leaks",
            "AC Direction Mode: Check for damage & functionality",
            "AC Temperature Control: Check for damage & functionality",
            "AC Blower: Check for damage & abnormal noise",
            "AC Display: Check for damage & functionality",
            "AC Filter: Check for unclean / dirty filter & bad odour",
            "AC Gas: Check level",
            "Cooling Coil: Check for leaks",
            "Heater Core: Check for leaks",
            "Hoses & Lines: Check for leaks",
            "AC Sensors: Check for functionality",
            "AC System: Check cooling / heating",
            "Airbags: Check for condition",
            "AC Vents: Check for damage",
            "Bonnet Release: Check for damage & functionality",
            "Cabin Lights: Check for damage & functionality",
            "Cluster Panel: Check for meter tampering or malfunctions",
            "Fuel Lid Release: Check for functionality",
            "Gauges & Meters: Check for functionality",
            "Glove Box: Check for damage & abnormal noise",
            "Center Console: Check for damage & abnormal noise",
            "Center console: Check for alignment issue",
            "Dashboard: Check for damage & abnormal noise",
            "Dashboard: Check for Scratches",
            "Dashboard: Check for alignment issue",
            "Headliner, Floor Carpet & Mats: Check if missing or damage",
            "Horn: Check for functionality",
            "Hornpad: Check for damage",
            "MIL Lights",
            "Locking System: Check for functionality",
            "Parking Cameras: Check for damage & functionality",
            "Parking Sensors: Check for Functionality",
            "Power Window: Check for functionality",
            "Power Window switches: Check for damage and functionality",
            "Rear Defogger: Check for functionality",
            "Seats: Check for functioning",
            "Seat Covers: Check for Damage,scuffs & stains",
            "Seat Belts: Check for functionality",
            "Seat Belts Locks: Check for functionality",
            "Side View Mirrors: Check for damage,noise & functionality",
            "Sunvisors: Check for damage & functionality",
            "Tool Kit: Check availability",
            "Jack: check for availability",
            "Trims: Check for damage, loose fitment or abnormal noise",
            "Parcel tray: Check for Damage & availability",
            "Interior cleaning: Check for cleaning",
            "Interior Safety: Check for flooded symptoms",
            "Interior Safety: Check for rat movement",
            "Keys: Check for Functionality",
            "Keys: Check for Damage"
        ]
    },

    /* ================= STEERING SYSTEM ================= */
    {
        section: "Steering System",
        startNo: 350,
        items: [
            "Ball Joints: Check for damage, play & abnormal noise",
            "Knuckles: Check for damage",
            "Power Steering Motor: Check for functionality",
            "Power Steering Fluid: Check level",
            "Power Steering Pump: Check for leaks & abnormal noise",
            "Steering Sensors: Check for functionality",
            "Steering Column: Check for damage & abnormal noise",
            "Steering Rack: Check for damage, play, leaks & abnormal noise",
            "Steering: Check tilt & telescopic adjustment",
            "Tie Rods: Check for bends, play & abnormal noise",
            "Steering: Check returnability & hardness",
            "Steering: Check alignment"
        ]
    },

    /* ================= BRAKE SYSTEM ================= */
    {
        section: "Brake System",
        startNo: 362,
        items: [
            "ABS & Sensors: Check for functionality",
            "Vacuum Booster: Check for functioning, damage & leaks",
            "Proportioning Valve: Check for leaks",
            "Brakes Calipers: Check for damage & leaks",
            "Brake Discs: Check for corrosion, wear & tear",
            "Brake Drums: Check for damage",
            "Brake Fluid: Check level",
            "Brake fluid: Check for quality",
            "Brakes Pads/Shoes: Check for wear & tear",
            "Hoses & Lines: Check for leaks",
            "Master Cylinder: Check for damages & leaks",
            "Parking Brake: Check for damage",
            "Parking Brake: Check for Functionality",
            "Wheel Cylinders: Check for leaks",
            "Brakes: Check for effectiveness & abnormal noise"
        ]
    },

    /* ================= SUSPENSION SYSTEM ================= */
    {
        section: "Suspension System",
        startNo: 377,
        items: [
            "Anti-Roll Bar: Check for cracks & bends",
            "Ball Joints & Bushes: Check for play, cracks & abnormal noise",
            "Coil Springs: Check for buckle or cracks",
            "Control Arms: Check for bends",
            "Lower arm: Check for Damage",
            "Lower arm: Check for noise",
            "Dead Axle: Check for bends & cracks",
            "Link Rods: Check for bends, play & abnormal noise",
            "Shock Absorbers: Check for damage & leaks",
            "Shock Absorber Mount: Check for Damage & noise",
            "Struts: Check for damage & leaks",
            "Strut Mount: Check for Damage & noise",
            "Wheel Bearings: Check for play & abnormal noise",
            "Wheel Hubs: Check for wear, tear as well as cracks",
            "Suspension: Check jounce & bounce",
            "Suspension: Check for stiffness & abnormal noise"
        ]
    },

    /* ================= WHEEL & TYRES ================= */
    {
        section: "Wheel & Tyres",
        startNo: 393,
        items: [
            "Alloy & Rims: Check for Damage & scratches",
            "Alloy & Rims: Check for wrong size",
            "Wheel caps: Check for Damage & availability",
            "Tyres: Check for bulges, chipping & cuts",
            "Tyres: Check for wrong size",
            "Tyres: Check for Hard Crack",
            "Tyres: Check for sidewall damage",

        ]
    },



    /* ================= WHEELS ================= */
    {
        section: "Tyres Manufacturing",
        startNo: 400,
        items: [
            { label: "A", text: "Front Right Tyre – Manufacturing week/year, Depth, Manufacturer", type: "TYRE" },
            { label: "B", text: "Rear Right Tyre – Manufacturing week/year, Depth, Manufacturer", type: "TYRE" },
            { label: "C", text: "Rear Left Tyre – Manufacturing week/year, Depth, Manufacturer", type: "TYRE" },
            { label: "D", text: "Front Left Tyre – Manufacturing week/year, Depth, Manufacturer", type: "TYRE" },
            { label: "E", text: "Spare Tyre – Manufacturing week/year, Depth, Manufacturer", type: "TYRE" }
        ]
    }

];

export default checklist;