import express, { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { roleAccess } from "../utils/middlewares/auth";

const router: Router = express.Router();

const prisma = new PrismaClient({
  log: ["query", "info", `warn`, `error`],
});
import { log } from "../utils/logger";

router.get("/names", (req: Request, res: Response, next: NextFunction) => {
  axios
    .get(process.env.SSO_API_URL + "/users", {
      params: req.query,
      headers: {
        Authorization: `Bearer ${process.env.SSO_API_KEY}@${process.env.SSO_API_SECRET}`,
      },
    })
    .then((response) => {
      res.withStatus.ok(
        "Get users successfully",
        response.data.data.map((user) => ({
          id: user.id,
          full_name: user.full_name,
        }))
      );
    })
    .catch((error) => {
      console.log(error);
      res.withStatus.badRequest("Something went wrong.");
      log(error, req, res);
    });
});

router.get(
  "/",
  roleAccess([1, 18]),
  (req: Request, res: Response, next: NextFunction) => {
    axios
      .get(process.env.SSO_API_URL + "/users", {
        params: req.query,
        headers: {
          Authorization: `Bearer ${process.env.SSO_API_KEY}@${process.env.SSO_API_SECRET}`,
        },
      })
      .then((response) => {
        res.withStatus.ok("Get users successfully", response.data.data);
      })
      .catch((error) => {
        console.log(error);
        res.withStatus.badRequest("Something went wrong.");
        log(error, req, res);
      });
  }
);

router.get("/:id", roleAccess([1, 18]), (req, res, next) => {
  const userId: number = parseInt(req.params.id);
  axios
    .get(process.env.SSO_API_URL + "/users/" + userId, {
      params: req.query,
      headers: {
        Authorization: `Bearer ${process.env.SSO_API_KEY}@${process.env.SSO_API_SECRET}`,
      },
    })
    .then(async (response) => {
      const user = response.data.data;
      let logistics_roles = await prisma.logistic_user_role.findMany({
        where: {
          UserId: userId,
        },
        include: {
          Role: {
            select: {
              id: true,
              Name: true,
            },
          },
        },
      });

      let roles_updated_at: Date | undefined;
      let roles_updated_by: string | undefined;

      if (logistics_roles.length > 0) {
        const creatorId = logistics_roles[0].CreatedByUserId;

        if (creatorId) {
          const {
            data: { data: creator },
          } = await axios.get(process.env.SSO_API_URL + "/users/" + creatorId, {
            params: req.query,
            headers: {
              Authorization: `Bearer ${process.env.SSO_API_KEY}@${process.env.SSO_API_SECRET}`,
            },
          });

          roles_updated_at = logistics_roles[0].CreatedAt;
          roles_updated_by = creator.staff.full_name;
        }
      }

      logistics_roles = logistics_roles.map((role) => role.Role);

      res.withStatus.ok("Get user details successfully", {
        id: user.id,
        staff_id: user.staff.staff_id,
        preferred_name: user.staff.preferred_name,
        staff_type: user.staff.staff_type.name,
        email: user.staff.email,
        company: (user.company && user.company.name) || "-",
        department: user.department.name || "-",
        building: user.building.name || "-",
        status: user.staff.status,
        updated_by: user.staff.updated_by,
        updated_at: user.staff.updated_at,
        job_title: user.staff.job_title,
        logistics_roles,
        roles_updated_at,
        roles_updated_by,
      });
    })
    .catch((error) => {
      console.log(error);
      res.withStatus.badRequest("Something went wrong.");
      log(error, req, res);
    });
});

router.post(
  "/:id/role-assignment",
  roleAccess([1, 18]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { role_ids } = req.body;
    const userId: number = parseInt(req.params.id);
    axios
      .get(process.env.SSO_API_URL + "/users/" + userId, {
        params: req.query,
        headers: {
          Authorization: `Bearer ${process.env.SSO_API_KEY}@${process.env.SSO_API_SECRET}`,
        },
      })
      .then(async (response) => {
        const roles = await prisma.logistic_role.findMany({
          where: {
            id: {
              in: role_ids,
            },
          },
        });

        if (roles.length < role_ids.length) {
          return res.withStatus.unprocessableEntity(
            "Some role IDs are not found"
          );
        }

        const user = await prisma.logistic_user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          await prisma.logistic_user.create({
            data: {
              id: userId,
            },
          });
        }

        await prisma.logistic_user_role.deleteMany({
          where: {
            UserId: userId,
          },
        });

        await prisma.logistic_user_role.createMany({
          data: roles.map((role) => ({
            RoleId: role.id,
            UserId: userId,
            CreatedByUserId: req.user.id,
          })),
        });

        return res.withStatus.ok("Successfully assign roles to user", null);
      })
      .catch((error) => {
        console.log(error);
        res.withStatus.notFound("User not found");
        log(error, req, res);
      });
  }
);

module.exports = router;
