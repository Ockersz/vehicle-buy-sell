module.exports = {};
const { z } = require('zod');

const VehicleType = z.enum([
  'CAR',
  'VAN',
  'SUV',
  'BIKE',
  'THREE_WHEEL',
  'BUS',
  'LORRY',
  'HEAVY',
  'TRACTOR',
  'BOAT',
  'OTHER',
]);

const ConditionType = z.enum(['NEW', 'USED', 'RECONDITIONED']);

const FuelType = z
  .enum(['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'CNG', 'OTHER'])
  .optional()
  .nullable();
const Transmission = z
  .enum(['MANUAL', 'AUTO', 'TIPTRONIC', 'CVT', 'OTHER'])
  .optional()
  .nullable();

const CreateListingSchema = z.object({
  vehicle_type: VehicleType,
  make: z.string().min(1).max(80),
  model: z.string().min(1).max(120),
  model_variant: z.string().max(120).optional().nullable(),
  year: z.number().int().min(1950).max(2100),

  condition_type: ConditionType,

  price_lkr: z.number().int().min(1),
  mileage_km: z.number().int().min(0).optional().nullable(),

  fuel_type: FuelType,
  transmission: Transmission,

  district_id: z.number().int().positive(),
  city_id: z.number().int().positive(),

  title: z.string().max(160).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),

  images: z
    .array(
      z.object({
        url: z.string().url().max(800),
        sort_order: z.number().int().min(0).max(9),
      })
    )
    .min(1)
    .max(10),
});

const UpdateListingSchema = z
  .object({
    make: z.string().min(1).max(80).optional(),
    model: z.string().min(1).max(120).optional(),
    model_variant: z.string().max(120).optional().nullable(),
    year: z.number().int().min(1950).max(2100).optional(),

    condition_type: ConditionType.optional(),

    price_lkr: z.number().int().min(1).optional(),
    mileage_km: z.number().int().min(0).optional().nullable(),

    fuel_type: FuelType,
    transmission: Transmission,

    district_id: z.number().int().positive().optional(),
    city_id: z.number().int().positive().optional(),

    title: z.string().max(160).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
  })
  .strict();

module.exports = {
  CreateListingSchema,
  UpdateListingSchema,
};
