[33mfd21001[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m feat(swagger): add shared schemas and JWT security
[33m2b72e3e[m feat(swagger): add Swagger UI infrastructure
[33mfaee6c8[m docs: update project documentation
[33mb3a2866[m fix(admin): remove duplicate admin route mount
[33m2451b5e[m feat(specialty): add patient specialty and doctor listing
[33mf6e2c62[m fix(rating): restrict doctor ratings to patients
[33m613e088[m feat(assistant): add OpenAI tool calling
[33m21a841b[m feat(assistant): add OpenAI AI provider
[33m6760944[m feat(assistant): add appointment search assistant
[33mdbeda54[m feat(auth): add otp phone cooldown
[33mc9aedbc[m feat(auth): add IP rate limiting
[33mcbdad92[m feat: add doctor rating statistics and management
[33mba0a601[m feat: add patient doctor rating
[33md6fba9a[m feat: add payment refund management
[33m567ae17[m feat: add period-based admin statistics
[33mbde8538[m feat: add doctor statistics
[33m1f76465[m feat: add admin statistics
[33m5b95b93[m feat: add payment refund handling and hardening
[33m9836c30[m feat: add admin payment management
[33m1c4231b[m feat: add admin appointment management
[33m5dd902d[m feat: add admin booking management
[33m0522fa9[m feat: add doctor patient no-show
[33mca229e5[m feat: add doctor booking completion
[33mbe12426[m feat: add doctor booking list and detail
[33mdb27fb7[m feat: add patient booking cancellation
[33m183a89d[m feat: add patient booking list and detail
[33m6fc4afd[m feat: expire reservation and cancel pending bookings
[33mb27f723[m fix: prevent booking past appointments
[33m5a01d51[m feat: connect payment flow to Zarinpal service
[33maa3348c[m feat: add payment callback and verification
[33mf427cf9[m test: add mock zarinpal payment gateway
[33m946900e[m feat: integrate payment creation with zarinpal
[33m442a5e8[m feat: add payment creation
[33me93390a[m feat: add doctor consultation fee
[33md667d3c[m feat: add booking creation
[33m8fd64d4[m feat: release expired reservations
[33ma905bc7[m feat: add atomic appointment reservation
[33me06937f[m feat: add doctor schedule visibility
[33m8e66e92[m feat: add doctors by clinic
[33m23f222b[m feat: add patient clinic listing
[33m7c0d50c[m feat: cleanup expired appointments
[33m0b40a4a[m feat: add admin appointment status management
[33m9509503[m refactor: separate admin appointment routes
[33mb1b531c[m feat: add pagination to available appointments
[33m343ec96[m feat: add appointment recovery on startup
[33mb694b7c[m feat: add daily appointment generation job
[33mb21c04e[m fix: align appointment generation with project week days
[33m9529d71[m refactor: prepare date-based appointment generation
[33m3e27488[m feat: add appointment slot generator
[33m82f2dcb[m feat: add available appointment model
[33m808946d[m feat: add doctor schedule management
[33m941fd66[m feat: add doctor schedule creation and time validation
[33m25ba317[m feat: add doctor schedule validators
[33md1f9c96[m fix: validate weekly schedule against clinic time policy
[33m7b0a0f5[m feat(schedule): implement weekly schedule CRUD
[33mca9816c[m feat(clinic): add clinic CRUD and time policy
[33mc0ec1e5[m feat(schedule): add scheduling and clinic time policy models
[33m7241a16[m fix: support image-only doctor updates and remove old profile images
[33m1b45e01[m feat(doctor): complete doctor management
[33m704f9d1[m feat: (doctor) allow patient, doctor, and admin access to get doctor by ID
[33ma8f0343[m feat(doctor): activate doctor and sync user roles simultaneously
[33m53c57d4[m feat: implement doctor management
[33me9d4475[m feat: add specialty update and activation
[33m129149e[m feat: complete clinic CRUD routes
[33m50cc37e[m chore: ignore uploaded doctor images
[33mf18131c[m refactor: move ObjectId validation to request validators
[33m53b8a63[m feat: add doctor profile image upload
[33m5a6d25b[m feat(specialty): add specialty management
[33mb9417fe[m fix(admin): correct user status filtering and pagination
[33md5e8dea[m refactor(validation): use validated body in controllers
[33m14ffbc8[m feat(pagination): add pagination and validated request data
[33m3f68fbb[m refactor: prepare validation for pagination
[33m53e24c0[m feat: add clinic management
[33mebe1100[m feat: add multi-role users and doctor application
[33m6ecf062[m feat(admin): add user list with status filter
[33m93a7373[m feat(auth): restore deleted users on otp verification
[33m88fa6ee[m feat(user): add admin user soft delete
[33m2ba712a[m feat(auth): enforce banned and deleted user restrictions
[33m74a30a2[m feat(auth): block OTP verification for banned or deleted users
[33mb3be116[m feat(auth): block OTP for deleted users
[33m924d0ce[m feat(auth): add profile completion guard
[33mec85c0b[m refactor(auth): centralize profile completion check
[33m77d5f34[m feat(user): add profile update
[33m432bb80[m feat(user): implement user ban and unban
[33mca64294[m feat(auth): add role guard
[33mcf3833b[m feat(auth): add logout flow
[33m0613e29[m feat(auth): add complete profile flow
[33me29fd10[m Refactor environment validation with Zod
[33m8b5e723[m refactor: improve refresh token hashing strategy
[33m9cbb249[m Implement refresh token rotation with Redis storage
[33m0374895[m feat: add jwt authentication middleware and protected user profile route
[33m4fa6f01[m feat: implement otp verification with jwt authentication
[33m1d45f52[m feat: complete OTP verification flow
[33m97c5713[m refactor: extract database and redis connections into config modules
[33m589c575[m feat: add auth routes, controllers, and otp validation
[33m3616035[m refactor: clean up bootstrap initialization
[33md0a00b7[m feat: implement response and error handling infrastructure
[33m54f349c[m docs: define API response architecture
[33m0ce217b[m docs: add project roadmap and backend glossary
[33m31b1438[m docs: add project dependencies documentation
[33mf256dfe[m chore: bootstrap project structure and development environment
[33m1ddc604[m Initial commit
