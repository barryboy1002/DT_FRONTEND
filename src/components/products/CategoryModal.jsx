import { useState } from "react";

function CategoryModal({
    isOpen,
    onClose,
    categories,
    onCreate,
    onDelete
}) {

    const [name, setName] =
        useState("");

    async function handleSubmit(e) {

        e.preventDefault();

        if (!name.trim()) return;

        await onCreate(name);

        setName("");
    }

    if (!isOpen) return null;

    return (
        <div
            className="
            fixed inset-0
            bg-black/50
            flex items-center
            justify-center
            z-50
            "
        >

            <div
                className="
                bg-white
                rounded-xl
                shadow-xl
                w-full
                max-w-lg
                "
            >

                <div
                    className="
                    flex
                    justify-between
                    items-center
                    p-6
                    border-b
                    "
                >

                    <h2
                        className="
                        text-xl
                        font-semibold
                        "
                    >
                        Manage Categories
                    </h2>

                    <button
                        onClick={onClose}
                        className="
                        text-gray-500
                        hover:text-gray-700
                        "
                    >
                        ✕
                    </button>

                </div>

                <div className="p-6">

                    <form
                        onSubmit={handleSubmit}
                        className="flex gap-3 mb-6"
                    >

                        <input
                            type="text"
                            placeholder="Category name"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            className="
                            flex-1
                            border
                            rounded-lg
                            px-4
                            py-2
                            "
                        />

                        <button
                            type="submit"
                            className="
                            bg-green-600
                            text-white
                            px-4
                            rounded-lg
                            "
                        >
                            Add
                        </button>

                    </form>

                    <div
                        className="
                        space-y-3
                        max-h-80
                        overflow-y-auto
                        "
                    >

                        {
                            categories.map(
                                category => (
                                    <div
                                        key={
                                            category.category_id
                                        }
                                        className="
                                        flex
                                        justify-between
                                        items-center
                                        border
                                        rounded-lg
                                        px-4
                                        py-3
                                        "
                                    >

                                        <span>
                                            {
                                                category.name
                                            }
                                        </span>

                                        <button
                                            onClick={() =>
                                                onDelete(
                                                    category.category_id
                                                )
                                            }
                                            className="
                                            text-red-600
                                            hover:text-red-700
                                            "
                                        >
                                            Delete
                                        </button>

                                    </div>
                                )
                            )
                        }

                    </div>

                </div>

            </div>

        </div>
    );
}

export default CategoryModal;