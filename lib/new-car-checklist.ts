export type CarPdiChecklistItem = {
    title: string;
    description: string;
};

export type CarPdiChecklistSection = {
    number: number;
    title: string;
    subtitle?: string;
    items: CarPdiChecklistItem[];
};

const carPdiChecklist: CarPdiChecklistSection[] = [
    {
        number: 1,
        title: "THE EXTERIOR",
        subtitle: "Look for Transit Damage",
        items: [
            {
                title: "Daylight Inspection:",
                description:
                    "Inspect the vehicle in broad daylight. Shadows and showroom lighting can sometimes conceal dents, scratches, or paint imperfections.",
            },
            {
                title: "Paint & Body:",
                description:
                    "Walk around the vehicle carefully from multiple angles. Check for uneven paint shades, dents, scratches, ripples, and inconsistent gaps between the doors, hood, and fenders.",
            },
            {
                title: "Bumpers & Trim:",
                description:
                    "Inspect the front and rear bumpers, grille, wheel-arch trims, badges, door handles, and other exterior components for cracks, scratches, loose fittings, or signs of damage.",
            },
            {
                title: "Glass & Mirrors:",
                description:
                    "Inspect the windshield, windows, and side mirrors for chips, cracks, scratches, or other damage.",
            },
            {
                title: "Doors, Hood & Boot:",
                description:
                    "Open and close every door, the hood, and the boot. Check that they align correctly, latch securely, and operate smoothly.",
            },
            {
                title: "Tyres:",
                description:
                    "Check the tyre manufacturing date on the sidewall. Ensure all tyres have good tread, are free from scuffs or damage, and appear new. Also inspect the spare tyre and confirm that the jack and toolkit are present in the boot.",
            },
            {
                title: "Wheels & Wheel Covers:",
                description:
                    "Check alloy wheels or wheel covers for scratches, dents, or curb damage.",
            },
            {
                title: "Underbody:",
                description:
                    "Where safely accessible, check for visible damage, loose components, or signs of leakage underneath the vehicle.",
            },
        ],
    },
    {
        number: 2,
        title: "THE INTERIOR",
        subtitle: "Check Fit & Finish",
        items: [
            {
                title: "Upholstery:",
                description:
                    "With permission, remove any protective plastic covers and inspect the seats for stains, tears, damage, or loose stitching.",
            },
            {
                title: "Dashboard & Plastics:",
                description:
                    "Check the dashboard, door panels, centre console, and other interior surfaces for scratches, marks, or damage. Open and close the glovebox and all storage compartments.",
            },
            {
                title: "Controls:",
                description:
                    "Test all switches and controls, including power windows, seat adjustments, central locking, mirrors, steering controls, and the sunroof, if equipped.",
            },
            {
                title: "Seat Belts:",
                description:
                    "Check every seat belt for proper locking, release, and smooth operation.",
            },
            {
                title: "Interior Lights:",
                description:
                    "Check the cabin, reading, boot, and vanity lights for proper operation.",
            },
            {
                title: "Odometer Reading:",
                description:
                    "Check the odometer before taking delivery. A new vehicle would typically have a relatively low reading, around 50–100 km. If the reading is significantly higher, ask the dealer for an explanation.",
            },
        ],
    },

    {
        number: 4,
        title: "UNDER THE HOOD",
        subtitle: "Mechanical Inspection",
        items: [
            {
                title: "Fluid Levels:",
                description:
                    "Check the engine oil, coolant, brake fluid, and windshield washer fluid. Confirm that the levels are within the recommended range.",
            },
            {
                title: "Engine Bay:",
                description:
                    "Inspect the engine compartment for fluid leaks, frayed or damaged wiring, corrosion, and rust around the battery terminals.",
            },
            {
                title: "Battery:",
                description:
                    "Check the battery condition, terminals, and visible wiring for corrosion, damage, or loose connections.",
            },
            {
                title: "Engine Start:",
                description:
                    "Start the engine and listen for unusual knocking, rattling, excessive vibration, or other abnormal sounds.",
            },
            {
                title: "VIN & Engine Number:",
                description:
                    "Verify the Vehicle Identification Number (VIN) and Engine Number on the vehicle against the details provided on the invoice and insurance documents.",
            },
        ],
    },
    {
        number: 5,
        title: "ESSENTIAL DOCUMENTATION",
        items: [
            {
                title: "Invoice & Receipts:",
                description:
                    "Confirm that you have the original vehicle invoice and receipts for road tax, accessories, and other applicable charges.",
            },
            {
                title: "Insurance Policy:",
                description:
                    "Check that the VIN, Engine Number, customer name, registration details, and other key information are accurate.",
            },
            {
                title: "Warranty Documents:",
                description:
                    "Collect the standard warranty and, if applicable, extended warranty documents with the dealer's required stamp or authorization.",
            },
            {
                title: "Owner's Manual:",
                description:
                    "Ensure that the physical or digital owner's manual is provided.",
            },
            {
                title: "Duplicate Keys:",
                description:
                    "Confirm that both sets of keys are provided and that each key works correctly.",
            },
            {
                title: "PUC Certificate:",
                description:
                    "Check that the Pollution Under Control (PUC) certificate is provided and valid for the applicable period.",
            },
            {
                title: "Registration Documents:",
                description:
                    "Verify the registration details and ensure the required registration documents are provided or that the registration process has been initiated correctly.",
            },
            {
                title: "Roadside Assistance:",
                description:
                    "Confirm whether roadside assistance is included and keep the emergency contact details.",
            },
            {
                title: "Accessories:",
                description:
                    "Verify all accessories included in the purchase order or invoice and confirm that they have been supplied and installed correctly.",
            },
        ],
    },
    {
        number: 6,
        title: "FINAL DELIVERY CHECK",
        items: [
            {
                title: "Final Walk-Around:",
                description:
                    "Before accepting delivery, perform one final walk-around and confirm that all agreed repairs, accessories, protective-film removal, cleaning, and cosmetic corrections have been completed.",
            },
            {
                title: "Photographic Record:",
                description:
                    "Take clear photographs of the vehicle's exterior, interior, VIN, odometer, tyre markings, and any existing damage before leaving the dealership.",
            },
        ],
    },
    {
        number: 3,
        title: "ELECTRICAL FEATURES",
        items: [
            {
                title: "Lights:",
                description:
                    "Test all exterior and interior lighting, including high and low beams, indicators, fog lamps, taillights, brake lights, reverse lights, and cabin lights.",
            },
            {
                title: "Infotainment:",
                description:
                    "Connect your phone using Bluetooth, Apple CarPlay, or Android Auto. Test the speakers, infotainment controls, USB ports, and reverse camera for proper operation and clarity.",
            },
            {
                title: "Air Conditioning:",
                description:
                    "Set the AC to its maximum cooling setting. It should begin cooling promptly and operate without unusual noises, rattling, or vibrations.",
            },
            {
                title: "Horn:",
                description:
                    "Test the horn and ensure it produces a clear and consistent sound.",
            },
            {
                title: "Wipers & Washers:",
                description:
                    "Test the front and rear wipers, washer jets, and different wiper speed settings.",
            },
        ],
    },
];

export default carPdiChecklist;
export { carPdiChecklist };
