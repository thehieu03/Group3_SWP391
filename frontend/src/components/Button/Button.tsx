import type {
    ElementType,
    ReactNode,
    ButtonHTMLAttributes,
    AnchorHTMLAttributes, FC
} from "react";
import {Link} from "react-router-dom";
import clsx from "clsx";

type ButtonProps = {
    to?: string;
    href?:string;
    children?:ReactNode;
    disabled?:boolean;
    target?:'_blank'|'_self'|'_parent'|'_top';
    leftIcon?:ReactNode;
    rightIcon?:ReactNode;
    className?:string;
    onClick?:()=>void;
}&ButtonHTMLAttributes<HTMLButtonElement>&AnchorHTMLAttributes<HTMLAnchorElement>;

const Button:FC<ButtonProps> = ({to,href,children,disabled,target,leftIcon,rightIcon,className,onClick,...rest}) => {
    let Comp:ElementType='button';
    const _props:Record<string, unknown>={
        onClick:onClick,
        ...rest
    }
    if (disabled) {
        Object.keys(_props).forEach(key => {
            if (key.startsWith('on') && typeof _props[key] === 'function') {
                delete _props[key];
            }
        });
    }
    if(to && !disabled){
        _props.to=to;
        Comp=Link;
    }else if(href&& !disabled){
        _props.href=href;
        if(target){
            _props.target=target;
        }
        Comp='a';
    }
    const baseClasses =
        "inline-flex items-center px-4 py-2 rounded-md font-semibold transition";
    const linkClasses =
        Comp === "a" ? "border-0 no-underline text-blue-500 hover:underline" : "";

    const classes = clsx(baseClasses, linkClasses, className);
    return (
        <Comp className={classes} {..._props}>
            {leftIcon&& <span className="mr-2">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon&& <span className="ml-2">{rightIcon}</span>}
        </Comp>
    );
};

export default Button;