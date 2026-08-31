import { HTTPException } from "hono/http-exception";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import { ensureInitialized } from "@/lib/utils";
import { PurchaseWishlistPresenter } from "@/presenters/purchase-wishlist-presenter";
import { TypeORMPurchaseWishlistRepository } from "@/repositories/typeorm/typeorm-purchase-wishlist-repository";
import { TypeORMWorkRepository } from "@/repositories/typeorm/typeorm-work-repository";
import { CreatePurchaseWishlistUseCase } from "@/use-cases/create-purchase-wishlist-use-case";
import { DeletePurchaseWishlistUseCase } from "@/use-cases/delete-purchase-wishlist-use-case";
import { GetPurchaseWishlistUseCase } from "@/use-cases/get-purchase-wishlist-use-case";
import { GetUserPurchaseWishlistUseCase } from "@/use-cases/get-user-purchase-wishlist-use-case";
import { UpdatePurchaseWishlistUseCase } from "@/use-cases/update-purchase-wishlist-use-case";
import type {
  CreatePurchaseWishlistRoute,
  DeletePurchaseWishlistRoute,
  GetPurchaseWishlistRoute,
  ListPurchaseWishlistRoute,
  UpdatePurchaseWishlistRoute,
} from "./purchase-wishlist.routes";

function requireUser(c: { get: (key: "user") => unknown }) {
  const user = c.get("user") as { id: string } | null;

  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  return user;
}

export const create: AppRouteHandler<CreatePurchaseWishlistRoute> = async (
  c,
) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const payload = c.req.valid("json");

  const purchaseWishlistRepository = new TypeORMPurchaseWishlistRepository(
    dataSource,
  );
  const worksRepository = new TypeORMWorkRepository(dataSource);
  const useCase = new CreatePurchaseWishlistUseCase(
    purchaseWishlistRepository,
    worksRepository,
  );

  const result = await useCase.execute({
    userId: user.id,
    payload: { ...payload, user_id: user.id },
  });

  if (!result.success) {
    return c.json({ message: "Work not found" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(
    PurchaseWishlistPresenter.toHTTP(result.data),
    HttpStatusCodes.OK,
  );
};

export const list: AppRouteHandler<ListPurchaseWishlistRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const purchaseWishlistRepository = new TypeORMPurchaseWishlistRepository(
    dataSource,
  );
  const useCase = new GetUserPurchaseWishlistUseCase(
    purchaseWishlistRepository,
  );

  const { items } = await useCase.execute({ userId: user.id });

  return c.json(
    PurchaseWishlistPresenter.toHTTPList(items),
    HttpStatusCodes.OK,
  );
};

export const get: AppRouteHandler<GetPurchaseWishlistRoute> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const { id } = c.req.valid("param");

  const purchaseWishlistRepository = new TypeORMPurchaseWishlistRepository(
    dataSource,
  );
  const useCase = new GetPurchaseWishlistUseCase(purchaseWishlistRepository);

  const result = await useCase.execute({
    userId: user.id,
    purchaseWishlistId: id,
  });

  if (!result.success) {
    return c.json(
      { message: "Wishlist item not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    PurchaseWishlistPresenter.toHTTP(result.data),
    HttpStatusCodes.OK,
  );
};

export const update: AppRouteHandler<UpdatePurchaseWishlistRoute> = async (
  c,
) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");

  const purchaseWishlistRepository = new TypeORMPurchaseWishlistRepository(
    dataSource,
  );
  const worksRepository = new TypeORMWorkRepository(dataSource);
  const useCase = new UpdatePurchaseWishlistUseCase(
    purchaseWishlistRepository,
    worksRepository,
  );

  const result = await useCase.execute({
    userId: user.id,
    purchaseWishlistId: id,
    payload,
  });

  if (!result.success) {
    const message =
      result.reason === "work_not_found" || result.reason === "work_forbidden"
        ? "Work not found"
        : "Wishlist item not found";
    return c.json({ message }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(
    PurchaseWishlistPresenter.toHTTP(result.data),
    HttpStatusCodes.OK,
  );
};

export const deletePurchaseWishlist: AppRouteHandler<
  DeletePurchaseWishlistRoute
> = async (c) => {
  const dataSource = await ensureInitialized();
  const user = requireUser(c);

  const { id } = c.req.valid("param");

  const purchaseWishlistRepository = new TypeORMPurchaseWishlistRepository(
    dataSource,
  );
  const useCase = new DeletePurchaseWishlistUseCase(
    purchaseWishlistRepository,
  );

  const { success } = await useCase.execute({
    userId: user.id,
    purchaseWishlistId: id,
  });

  if (!success) {
    return c.json(
      { success, message: "Wishlist item not found" },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(
    { success, message: "Wishlist item deleted" },
    HttpStatusCodes.OK,
  );
};
