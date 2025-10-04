import type {
    ElementType,
    ReactNode,
    ButtonHTMLAttributes,
    AnchorHTMLAttributes, FC
} from "react";
import {Link} from "react-router-dom";

type ButtonProps = {
    to?: string;
    href?:string;
    children?:ReactNode;
    disabled?:boolean;
    target?:'_blank'|'_self'|'_parent'|'_top';
    leftIcon?:ReactNode;
    rightIcon?:ReactNode;
    onClick?:()=>void;
}&ButtonHTMLAttributes<HTMLButtonElement>&AnchorHTMLAttributes<HTMLAnchorElement>;

const Button:FC<ButtonProps> = ({to,href,children,disabled,target,leftIcon,rightIcon,onClick,...rest}) => {
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
    return (
        <Comp {..._props}>
            {leftIcon&& <span>{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon&& <span>{rightIcon}</span>}
        </Comp>
    );
};

export default Button;